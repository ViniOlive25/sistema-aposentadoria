
import { UserData, AnalysisResult, RuleResult, RequirementStatus, Gender, Role, DisabilityDegree } from '../types';
import {
  MIN_CONTRIBUTION,
  PERMANENT_RULE_MIN_CONTRIBUTION,
  MIN_AGE_TOLL,
  MIN_AGE_POINTS,
  MIN_AGE_PERMANENT,
  MIN_AGE_COMPULSORY,
  MIN_PUBLIC_SERVICE_DAYS,
  MIN_ROLE_SERVICE_DAYS,
  REFORM_DATE_2020,
  EC41_DATE,
  EC20_DATE,
  POINTS_TABLE,
  MIN_CONTRIBUTIONS_DISABLED_RULE,
  MIN_AGE_DISABLED,
  MIN_CONTRIBUTION_DISABLED
} from '../constants';

// --- HELPER FUNCTIONS ---
const Y = 365.25;

const getAgeReductionDays = (userData: UserData, contributionDaysToday: number, minContributionWithoutToll: number): number => {
    // Para o servidor ADMINISTRATIVO que tenha ingressado até 16/12/1998
    if (userData.role === Role.Administrative && parseDate(userData.entryDate) <= EC20_DATE) {
        // Redução de 1 dia na idade para cada 1 dia de contribuição que exceder o mínimo (sem o pedágio)
        const excessContributionDays = Math.max(0, contributionDaysToday - minContributionWithoutToll);
        return excessContributionDays;
    }
    return 0;
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) throw new Error("Uma data obrigatória não foi fornecida.");
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Data inválida: ${dateStr}`);
  return new Date(year, month - 1, day);
};

const daysBetween = (date1: Date, date2: Date): number => {
    return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDays = (totalDays: number): string => {
    if (totalDays <= 0) return "0 dias";
    const years = Math.floor(totalDays / Y);
    const months = Math.floor((totalDays % Y) / (Y / 12));
    const days = Math.round(totalDays % (Y / 12));
    let result = '';
    if (years > 0) result += `${years} ano${years > 1 ? 's' : ''}`;
    if (months > 0) result += `${result ? ', ' : ''}${months} m${months > 1 ? 'eses' : 'ês'}`;
    if (days > 0) result += `${result ? ' e ' : ''}${days} dia${days > 1 ? 's' : ''}`;
    return result || '0 dias';
};

const getRequiredPoints = (key: string, year: number): number => {
    const table = POINTS_TABLE[key];
    const years = Object.keys(table).map(Number).sort();
    for (const y of years) {
        if (year <= y) return table[y];
    }
    return table[years[years.length - 1]];
};

const createRequirementStatus = (
    label: string,
    required: string,
    current: string,
    met: boolean,
    currentValue?: number,
    requiredValue?: number,
): RequirementStatus => {
    const status: RequirementStatus = { label, required, current, met, currentValue, requiredValue };
    if (!met && requiredValue && currentValue !== undefined && requiredValue > currentValue) {
        if (!label.toLowerCase().includes('ponto')) {
            status.missing = formatDays(Math.ceil(requiredValue - currentValue));
        }
    }
    return status;
};

const calculateOverallProgress = (requirements: RequirementStatus[]): number => {
    const requirementsWithProgress = requirements.filter(
      r => !r.met && typeof r.currentValue !== 'undefined' && typeof r.requiredValue !== 'undefined' && r.requiredValue > 0
    );
    if (requirementsWithProgress.length === 0) return 100;

    const totalProgress = requirementsWithProgress.reduce((acc, req) => {
        const progress = (req.currentValue! / req.requiredValue!) * 100;
        return acc + Math.min(progress, 100);
    }, 0);
    return totalProgress / requirementsWithProgress.length;
}

const getDaysToAge = (birthDate: Date, ageYears: number): number => {
    const target = new Date(birthDate);
    target.setFullYear(target.getFullYear() + ageYears);
    return daysBetween(birthDate, target);
};

// --- PROJECTION ENGINE ---
const projectEligibilityDate = (
    checkerFunction: (data: UserData, date: Date, age: number, contribution: number, contribution2020?: number) => RuleResult,
    data: UserData,
    initialAge: number,
    initialContribution: number,
    initialContribution2020?: number,
): Date | null => {
    const today = new Date();
    let projectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let projectedAge = initialAge;
    let projectedContribution = initialContribution;
    const maxProjectionYears = 40; // Safety break

    for (let i = 0; i < maxProjectionYears * Y; i++) {
        projectedDate.setDate(projectedDate.getDate() + 1);
        projectedAge++;
        projectedContribution++;
        
        const result = checkerFunction(data, projectedDate, projectedAge, projectedContribution, initialContribution2020);
        if (result.eligible) {
            return projectedDate;
        }
    }
    return null;
};

// --- RULE CHECKERS ---

function checkTransitionPointsRule(data: UserData, today: Date, ageInDaysToday: number, contributionDaysToday: number): RuleResult {
    const key = `${data.role === Role.Teacher ? 'teacher_' : ''}${data.gender}`;
    const minContribution = MIN_CONTRIBUTION[key as keyof typeof MIN_CONTRIBUTION];
    
    const birthDate = parseDate(data.birthDate);
    const originalMinAgeYears = MIN_AGE_POINTS[key as keyof typeof MIN_AGE_POINTS];
    const baseMinAgeInDays = getDaysToAge(birthDate, originalMinAgeYears);
    
    // Cálculo da redução em dias (para ingresso até 16/12/1998)
    const reductionInDays = getAgeReductionDays(data, contributionDaysToday, minContribution);
    const requiredAgeInDays = baseMinAgeInDays - reductionInDays;

    let ageRequirementLabel = `${originalMinAgeYears} anos`;
    if (reductionInDays > 0) {
        const reducedAgeYears = requiredAgeInDays / Y;
        ageRequirementLabel = `${originalMinAgeYears} anos (Reduzido para ${reducedAgeYears.toFixed(1)} anos pela regra de ingresso até 16/12/1998)`;
    }

    const requiredPoints = getRequiredPoints(key, today.getFullYear());
    
    const ageInYearsToday = ageInDaysToday / Y;
    const contributionInYearsToday = contributionDaysToday / Y;
    const currentPoints = ageInYearsToday + contributionInYearsToday;

    const entryDateObj = parseDate(data.entryDate);
    const cargoDaysToday = daysBetween(entryDateObj, today);
    const minCargoDays = MIN_ROLE_SERVICE_DAYS;
    const isCargoMet = cargoDaysToday >= minCargoDays;

    const requirements: RequirementStatus[] = [
        createRequirementStatus('Idade Mínima', ageRequirementLabel, formatDays(ageInDaysToday), ageInDaysToday >= requiredAgeInDays, ageInDaysToday, requiredAgeInDays),
        createRequirementStatus('Tempo de Contribuição Mínimo', formatDays(minContribution), formatDays(contributionDaysToday), contributionDaysToday >= minContribution, contributionDaysToday, minContribution),
        createRequirementStatus('Pontuação Mínima', `${requiredPoints} pontos`, `${currentPoints.toFixed(2)} pontos`, currentPoints >= requiredPoints, currentPoints, requiredPoints),
        { label: 'Tempo de Serviço Público', required: '10 anos', current: 'Assumido como cumprido', met: true },
        createRequirementStatus('Tempo no Cargo Efetivo', '5 anos', formatDays(cargoDaysToday), isCargoMet, cargoDaysToday, minCargoDays),
    ];

    const allMet = requirements.every(r => r.met);
    
    // Regra de Remuneração ajustada:
    // Integralidade e Paridade para quem ingressou até 31/12/2003 E atingiu 65 (H) / 60 (M).
    const isPre2003 = entryDateObj <= EC41_DATE;
    const requiredParityAge = data.gender === Gender.Male ? 65 : 60;
    const minParityAgeDays = getDaysToAge(birthDate, requiredParityAge);
    
    let remuneration = 'Média das contribuições';
    if (isPre2003) {
        if (ageInDaysToday > minParityAgeDays) {
            remuneration = 'Integralidade e Paridade';
        } else {
            remuneration = `Média das contribuições (Integralidade e Paridade apenas aos ${requiredParityAge} anos)`;
        }
    }

    return {
        ruleName: 'Regra de Transição por Pontos',
        description: 'Soma da idade e do tempo de contribuição, com requisitos mínimos de idade e contribuição.',
        eligible: allMet,
        remuneration,
        requirements,
        overallProgress: calculateOverallProgress(requirements),
    };
}


function checkTransitionTollRule(data: UserData, today: Date, ageInDaysToday: number, contributionDaysToday: number, contributionDays2020: number): RuleResult {
    const key = `${data.role === Role.Teacher ? 'teacher_' : ''}${data.gender}`;
    const minContribution = MIN_CONTRIBUTION[key as keyof typeof MIN_CONTRIBUTION];
    const birthDate = parseDate(data.birthDate);
    const originalMinAgeYears = MIN_AGE_TOLL[key as keyof typeof MIN_AGE_TOLL];
    const baseMinAgeInDays = getDaysToAge(birthDate, originalMinAgeYears);

    const contributionMissingOnReform = Math.max(0, minContribution - contributionDays2020);
    const toll = contributionMissingOnReform * 0.5;
    const totalRequiredContribution = minContribution + toll;

    // Cálculo da redução em dias (para ingresso até 16/12/1998)
    // Conforme solicitado: contabilizada a partir do tempo mínimo SEM pedágio
    const reductionInDays = getAgeReductionDays(data, contributionDaysToday, minContribution);
    const requiredAgeInDays = baseMinAgeInDays - reductionInDays;

    let ageRequirementLabel = `${originalMinAgeYears} anos`;
    if (reductionInDays > 0) {
        const reducedAgeYears = requiredAgeInDays / Y;
        ageRequirementLabel = `${originalMinAgeYears} anos (Reduzido para ${reducedAgeYears.toFixed(1)} anos pela regra de ingresso até 16/12/1998)`;
    }

    const entryDateObj = parseDate(data.entryDate);
    const cargoDaysToday = daysBetween(entryDateObj, today);
    const minCargoDays = MIN_ROLE_SERVICE_DAYS;
    const isCargoMet = cargoDaysToday >= minCargoDays;

    const requirements: RequirementStatus[] = [
        createRequirementStatus('Idade Mínima', ageRequirementLabel, formatDays(ageInDaysToday), ageInDaysToday >= requiredAgeInDays, ageInDaysToday, requiredAgeInDays),
        createRequirementStatus('Tempo de Contribuição + Pedágio', formatDays(totalRequiredContribution), formatDays(contributionDaysToday), contributionDaysToday >= totalRequiredContribution, contributionDaysToday, totalRequiredContribution),
        { label: 'Tempo de Serviço Público', required: '10 anos', current: 'Assumido como cumprido', met: true },
        createRequirementStatus('Tempo no Cargo Efetivo', '5 anos', formatDays(cargoDaysToday), isCargoMet, cargoDaysToday, minCargoDays),
    ];
    
    const allMet = requirements.every(r => r.met);
    const remuneration = entryDateObj <= EC41_DATE ? 'Integralidade e Paridade' : 'Média das contribuições';

    return {
        ruleName: 'Regra de Transição com Pedágio de 50%',
        description: 'Cumprir o tempo de contribuição que faltava em 15/09/2020, acrescido de um pedágio de 50%.',
        eligible: allMet,
        remuneration,
        requirements,
        overallProgress: calculateOverallProgress(requirements),
    };
}


function checkVestedRightsRule(data: UserData, today: Date, ageInDaysToday: number, contributionDaysToday: number, contributionDays2020: number): RuleResult {
    const entryDate = parseDate(data.entryDate);
    const birthDate = parseDate(data.birthDate);
    const ageInDays2020 = daysBetween(birthDate, REFORM_DATE_2020);
    const isTeacher = data.role === Role.Teacher;
    const teacherReduction = isTeacher ? 5 : 0;
    const isMale = data.gender === Gender.Male;
    const key = `${isTeacher ? 'teacher_' : ''}${data.gender}`;

    const evaluate = (name: string, reqs: RequirementStatus[], remuneration: string) => {
        return { name, reqs, eligible: reqs.every(r => r.met), remuneration };
    };

    const subRules = [];

    // REGRA 1 (EC 47/05) - Ingresso até 16/12/98
    if (entryDate <= EC20_DATE) {
        const minContrib = (isMale ? 35 : 30) - teacherReduction;
        const minContribDays = minContrib * Y;
        const extraContribDays = Math.max(0, contributionDays2020 - minContribDays);
        const extraYears = extraContribDays / Y;
        const baseAge = (isMale ? 60 : 55) - teacherReduction;
        const requiredAge = Math.max(isMale ? 48 : 43, baseAge - Math.floor(extraYears)); // Redutor de idade
        const minAgeDays = getDaysToAge(birthDate, requiredAge);

        subRules.push(evaluate('Regra 1 (EC 47/05)', [
            createRequirementStatus('Ingresso até 16/12/98', 'Sim', 'Sim', true),
            createRequirementStatus('Contribuição em 15/09/2020', formatDays(minContribDays), formatDays(contributionDays2020), contributionDays2020 >= minContribDays, contributionDays2020, minContribDays),
            createRequirementStatus('Idade em 15/09/2020 (com redutor)', `${requiredAge} anos`, formatDays(ageInDays2020), ageInDays2020 >= minAgeDays, ageInDays2020, minAgeDays),
            { label: 'Serviço Público', required: '25 anos', current: 'Assumido', met: true },
            { label: 'Carreira', required: '15 anos', current: 'Assumido', met: true },
            { label: 'No Cargo', required: '5 anos', current: 'Assumido', met: true },
        ], 'Integralidade e Paridade'));
    }

    // REGRA 2 (EC 41/03) - Ingresso até 31/12/03
    if (entryDate <= EC41_DATE) {
        const minAge = (isMale ? 60 : 55) - teacherReduction;
        const minAgeDays = getDaysToAge(birthDate, minAge);
        const minContrib = (isMale ? 35 : 30) - teacherReduction;
        const minContribDays = minContrib * Y;

        subRules.push(evaluate('Regra 2 (EC 41/03)', [
            createRequirementStatus('Ingresso até 31/12/03', 'Sim', 'Sim', true),
            createRequirementStatus('Idade em 15/09/2020', `${minAge} anos`, formatDays(ageInDays2020), ageInDays2020 >= minAgeDays, ageInDays2020, minAgeDays),
            createRequirementStatus('Contribuição em 15/09/2020', formatDays(minContribDays), formatDays(contributionDays2020), contributionDays2020 >= minContribDays, contributionDays2020, minContribDays),
            { label: 'Serviço Público', required: '20 anos', current: 'Assumido', met: true },
            { label: 'Carreira', required: '10 anos', current: 'Assumido', met: true },
            { label: 'No Cargo', required: '5 anos', current: 'Assumido', met: true },
        ], 'Integralidade e Paridade'));
    }

    // REGRA 3 (Art. 40 - Média)
    const minAge3 = (isMale ? 60 : 55) - teacherReduction;
    const minAgeDays3 = getDaysToAge(birthDate, minAge3);
    const minContrib3 = (isMale ? 35 : 30) - teacherReduction;
    const minContribDays3 = minContrib3 * Y;
    subRules.push(evaluate('Regra 3 (Art. 40 - Média)', [
        createRequirementStatus('Idade em 15/09/2020', `${minAge3} anos`, formatDays(ageInDays2020), ageInDays2020 >= minAgeDays3, ageInDays2020, minAgeDays3),
        createRequirementStatus('Contribuição em 15/09/2020', formatDays(minContribDays3), formatDays(contributionDays2020), contributionDays2020 >= minContribDays3, contributionDays2020, minContribDays3),
        { label: 'Serviço Público', required: '10 anos', current: 'Assumido', met: true },
        { label: 'No Cargo', required: '5 anos', current: 'Assumido', met: true },
    ], 'Média (sem paridade)'));

    // REGRA 4 (Proporcional)
    const minAge4 = isMale ? 65 : 60;
    const minAgeDays4 = getDaysToAge(birthDate, minAge4);
    subRules.push(evaluate('Regra 4 (Proporcional)', [
        createRequirementStatus('Idade em 15/09/2020', `${minAge4} anos`, formatDays(ageInDays2020), ageInDays2020 >= minAgeDays4, ageInDays2020, minAgeDays4),
        { label: 'Tempo de Serviço Público', required: '10 anos', current: 'Assumido como cumprido', met: true },
        { label: 'Tempo no Cargo Efetivo', required: '5 anos', current: 'Assumido como cumprido', met: true },
    ], 'Proporcional (sem paridade)'));

    // REGRA 5 (Pedágio 20%) - Ingresso até 16/12/98
    if (entryDate <= EC20_DATE) {
        const minAge5 = (isMale ? 53 : 48) - teacherReduction;
        const minAgeDays5 = getDaysToAge(birthDate, minAge5);
        const targetContrib = (isMale ? 35 : 30) - teacherReduction;
        const targetContribDays = targetContrib * Y;
        
        const contribIn1998 = daysBetween(entryDate, EC20_DATE);
        const missingIn1998 = Math.max(0, targetContribDays - contribIn1998);
        const toll = missingIn1998 * 0.2;
        const totalRequired = targetContribDays + toll;

        // Adicionando a compensação de tempo e idade solicitado pelo usuário para ingresso até 16/12/1998
        // A redução é de 1 para 1 excedendo o tempo mínimo (targetContribDays)
        const reductionInDays = getAgeReductionDays(data, contributionDays2020, targetContribDays);
        const requiredAgeInDays = minAgeDays5 - reductionInDays;

        let ageLabel = `${minAge5} anos`;
        if (reductionInDays > 0) {
            const reducedAge = requiredAgeInDays / Y;
            ageLabel = `${minAge5} anos (Reduzido para ${reducedAge.toFixed(1)} anos)`;
        }

        subRules.push(evaluate('Regra 5 (Pedágio 20%)', [
            createRequirementStatus('Ingresso até 16/12/98', 'Sim', 'Sim', true),
            createRequirementStatus('Idade em 15/09/2020', ageLabel, formatDays(ageInDays2020), ageInDays2020 >= requiredAgeInDays, ageInDays2020, requiredAgeInDays),
            createRequirementStatus('Contribuição + Pedágio 20%', formatDays(totalRequired), formatDays(contributionDays2020), contributionDays2020 >= totalRequired, contributionDays2020, totalRequired),
            { label: 'No Cargo', required: '5 anos', current: 'Assumido', met: true },
        ], 'Média com redutor (sem paridade)'));
    }

    // Find best rule
    const eligibleRules = subRules.filter(r => r.eligible);
    let bestRule;
    if (eligibleRules.length > 0) {
        // Preference: Integralidade/Paridade > Média > Proporcional
        bestRule = eligibleRules.find(r => r.remuneration.includes('Integralidade')) ||
                   eligibleRules.find(r => r.remuneration.includes('Média')) ||
                   eligibleRules[0];
    } else {
        // Pick the one with highest progress
        bestRule = subRules.sort((a, b) => calculateOverallProgress(b.reqs) - calculateOverallProgress(a.reqs))[0];
    }

    return {
        ruleName: 'Direito Adquirido',
        description: `Simulação baseada nas regras vigentes até 14/09/2020. ${bestRule.eligible ? `Elegível pela ${bestRule.name}.` : `Análise baseada na ${bestRule.name}.`}`,
        eligible: bestRule.eligible,
        remuneration: bestRule.remuneration,
        requirements: bestRule.reqs,
        overallProgress: calculateOverallProgress(bestRule.reqs),
    };
}


function checkPermanentRule(data: UserData, today: Date, ageInDaysToday: number, contributionDaysToday: number): RuleResult {
    const key = `${data.role === Role.Teacher ? 'teacher_' : ''}${data.gender}`;
    const minAge = MIN_AGE_PERMANENT[key as keyof typeof MIN_AGE_PERMANENT];
    const minContribution = PERMANENT_RULE_MIN_CONTRIBUTION;
    const birthDate = parseDate(data.birthDate);
    const minAgeDays = getDaysToAge(birthDate, minAge);

    const entryDateObj = parseDate(data.entryDate);
    const cargoDaysToday = daysBetween(entryDateObj, today);
    const minCargoDays = MIN_ROLE_SERVICE_DAYS;
    const isCargoMet = cargoDaysToday >= minCargoDays;

    const requirements: RequirementStatus[] = [
        createRequirementStatus('Idade Mínima', `${minAge} anos`, formatDays(ageInDaysToday), ageInDaysToday > minAgeDays, ageInDaysToday, minAgeDays),
        createRequirementStatus('Tempo de Contribuição Mínimo', formatDays(minContribution), formatDays(contributionDaysToday), contributionDaysToday >= minContribution, contributionDaysToday, minContribution),
        { label: 'Tempo de Serviço Público', required: '10 anos', current: 'Assumido como cumprido', met: true },
        createRequirementStatus('Tempo no Cargo Efetivo', '5 anos', formatDays(cargoDaysToday), isCargoMet, cargoDaysToday, minCargoDays),
    ];

    const allMet = requirements.every(r => r.met);
    
    return {
        ruleName: 'Regra Permanente',
        description: 'Para quem ingressou no serviço público após 15/09/2020 ou para quem não se enquadra nas regras de transição.',
        eligible: allMet,
        remuneration: 'Média das contribuições',
        requirements,
        overallProgress: calculateOverallProgress(requirements),
    };
}

function checkCompulsoryRule(data: UserData, today: Date, ageInDaysToday: number, contributionDaysToday: number): RuleResult {
    const birthDate = parseDate(data.birthDate);
    const minAgeDays = getDaysToAge(birthDate, MIN_AGE_COMPULSORY);
    const eligible = ageInDaysToday >= (minAgeDays + 1);

    const contributionInYears = contributionDaysToday / Y;
    let remuneration: string;

    if (contributionInYears < 20) {
        remuneration = 'Proporcional à média das contribuições';
    } else {
        const yearsOver20 = Math.floor(contributionInYears - 20);
        const percentage = 60 + (yearsOver20 * 2);
        const finalPercentage = Math.min(100, percentage);
        remuneration = `Média das contribuições (${finalPercentage}%)`;
    }

    const requirements: RequirementStatus[] = [
        createRequirementStatus('Idade Limite', `${MIN_AGE_COMPULSORY} anos`, formatDays(ageInDaysToday), eligible, ageInDaysToday, minAgeDays + 1),
    ];

    return {
        ruleName: 'Aposentadoria Compulsória',
        description: 'Ocorre obrigatoriamente um dia após completar 75 anos. O benefício é calculado com base na média das contribuições e no tempo total de serviço.',
        eligible,
        remuneration,
        requirements,
        overallProgress: calculateOverallProgress(requirements),
    };
}

function checkDisabledContributionRule(data: UserData, today: Date, ageInDaysToday: number, contributionDaysToday: number): RuleResult {
    if (!data.disabilityDegree || data.disabilityDegree === DisabilityDegree.None) {
        return { eligible: false } as RuleResult; 
    }
    
    const genderKey = data.gender as keyof typeof MIN_CONTRIBUTION_DISABLED['grave'];
    const degreeKey = data.disabilityDegree as 'grave' | 'moderada' | 'leve';
    
    const minContribution = MIN_CONTRIBUTION_DISABLED[degreeKey][genderKey];

    const contributionInYears = contributionDaysToday / Y;
    const remunerationPercentage = Math.min(100, 70 + Math.floor(contributionInYears));
    const remuneration = `Média das contribuições (${remunerationPercentage}%)`;

    const requirements: RequirementStatus[] = [
        createRequirementStatus('Tempo de Contribuição (conforme grau)', formatDays(minContribution), formatDays(contributionDaysToday), contributionDaysToday >= minContribution, contributionDaysToday, minContribution),
        createRequirementStatus('Total de Contribuições Mínimas (180)', formatDays(MIN_CONTRIBUTIONS_DISABLED_RULE), formatDays(contributionDaysToday), contributionDaysToday >= MIN_CONTRIBUTIONS_DISABLED_RULE, contributionDaysToday, MIN_CONTRIBUTIONS_DISABLED_RULE),
        { label: 'Tempo de Serviço Público', required: '10 anos', current: 'Assumido como cumprido', met: true },
        { label: 'Tempo no Cargo', required: '5 anos', current: 'Assumido como cumprido', met: true },
    ];

    const allMet = requirements.every(r => r.met);
    const degreeName = degreeKey.charAt(0).toUpperCase() + degreeKey.slice(1);

    return {
        ruleName: `Aposentadoria da Pessoa com Deficiência (Contribuição - Grau ${degreeName})`,
        description: 'Regra da LC 142/2013, com tempo de contribuição reduzido conforme o grau da deficiência.',
        eligible: allMet,
        remuneration,
        requirements,
        overallProgress: calculateOverallProgress(requirements),
    };
}

function checkDisabledAgeRule(data: UserData, today: Date, ageInDaysToday: number, contributionDaysToday: number): RuleResult {
    const genderKey = data.gender as keyof typeof MIN_AGE_DISABLED;
    const minAge = MIN_AGE_DISABLED[genderKey];
    const birthDate = parseDate(data.birthDate);
    const minAgeDays = getDaysToAge(birthDate, minAge);

    const requirements: RequirementStatus[] = [
        createRequirementStatus('Idade Mínima', `${minAge} anos`, formatDays(ageInDaysToday), ageInDaysToday > minAgeDays, ageInDaysToday, minAgeDays),
        createRequirementStatus('Total de Contribuições Mínimas (180)', formatDays(MIN_CONTRIBUTIONS_DISABLED_RULE), formatDays(contributionDaysToday), contributionDaysToday >= MIN_CONTRIBUTIONS_DISABLED_RULE, contributionDaysToday, MIN_CONTRIBUTIONS_DISABLED_RULE),
        { label: 'Tempo de Serviço Público', required: '10 anos', current: 'Assumido como cumprido', met: true },
        { label: 'Tempo no Cargo', required: '5 anos', current: 'Assumido como cumprido', met: true },
    ];

    const allMet = requirements.every(r => r.met);
    
    return {
        ruleName: 'Aposentadoria da Pessoa com Deficiência (Idade)',
        description: 'Regra alternativa por idade para servidores com deficiência, baseada na LC 142/2013.',
        eligible: allMet,
        remuneration: '100% da média (80% maiores salários)',
        requirements,
        overallProgress: calculateOverallProgress(requirements),
    };
}


// --- MAIN ORCHESTRATOR ---
export const analyzeRetirement = (data: UserData): AnalysisResult => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const birthDate = parseDate(data.birthDate);
    const entryDate = parseDate(data.entryDate);

    if (birthDate > today || entryDate > today || birthDate > entryDate) {
        throw new Error("As datas fornecidas são inválidas. Verifique a data de nascimento e de ingresso.");
    }
    
    let processedContribution2020 = data.contributionDays_2020;
    let contributionDaysUpToToday = data.contributionDays_today;

    if (!contributionDaysUpToToday || contributionDaysUpToToday <= 0) {
        if (processedContribution2020 > 0) {
            const daysSinceReform = daysBetween(REFORM_DATE_2020, today);
            contributionDaysUpToToday = processedContribution2020 + daysSinceReform;
        } else {
            contributionDaysUpToToday = Math.max(0, daysBetween(entryDate, today));
            if (entryDate < REFORM_DATE_2020) {
                processedContribution2020 = Math.max(0, daysBetween(entryDate, REFORM_DATE_2020));
            } else {
                processedContribution2020 = 0;
            }
        }
    }

    if (data.hasAveragedTime && data.averagedTimeInDays) {
        processedContribution2020 += data.averagedTimeInDays;
        contributionDaysUpToToday += data.averagedTimeInDays;
    }

    let feriasPremioIncluded = 0;
    if (data.hasFeriasPremio && data.feriasPremioDays) {
        feriasPremioIncluded = data.feriasPremioDays * 2;
        processedContribution2020 += feriasPremioIncluded;
        contributionDaysUpToToday += feriasPremioIncluded;
    }

    const ageInDaysToday = daysBetween(birthDate, today);
    
    const rulesCalculations = [];

    if (entryDate <= EC41_DATE) {
        rulesCalculations.push({
            checker: (d: UserData, t: Date, age: number, contrib: number, contrib2020: number) => checkVestedRightsRule(d, t, age, contrib, contrib2020),
            args: [data, today, ageInDaysToday, contributionDaysUpToToday, processedContribution2020]
        });
    }

    if (entryDate <= REFORM_DATE_2020) {
        rulesCalculations.push({
            checker: (d: UserData, t: Date, age: number, contrib: number) => checkTransitionPointsRule(d, t, age, contrib),
            args: [data, today, ageInDaysToday, contributionDaysUpToToday]
        });
        rulesCalculations.push({
            checker: (d: UserData, t: Date, age: number, contrib: number, contrib2020: number) => checkTransitionTollRule(d, t, age, contrib, contrib2020),
            args: [data, today, ageInDaysToday, contributionDaysUpToToday, processedContribution2020]
        });
    }
    
    rulesCalculations.push({
        checker: (d: UserData, t: Date, age: number, contrib: number) => checkPermanentRule(d, t, age, contrib),
        args: [data, today, ageInDaysToday, contributionDaysUpToToday]
    });

    if (data.disabilityDegree && data.disabilityDegree !== DisabilityDegree.None) {
        rulesCalculations.push({
            checker: (d: UserData, t: Date, age: number, contrib: number) => checkDisabledContributionRule(d, t, age, contrib),
            args: [data, today, ageInDaysToday, contributionDaysUpToToday]
        });
        rulesCalculations.push({
            checker: (d: UserData, t: Date, age: number, contrib: number) => checkDisabledAgeRule(d, t, age, contrib),
            args: [data, today, ageInDaysToday, contributionDaysUpToToday]
        });
    }
    
    const rules: RuleResult[] = rulesCalculations.map(({ checker, args }) => {
        const result = checker(...args);
        if (!result.eligible && result.ruleName !== 'Direito Adquirido') {
             const projectedDate = projectEligibilityDate(
                checker, 
                data, 
                ageInDaysToday, 
                contributionDaysUpToToday, 
                processedContribution2020
            );

            if (projectedDate) {
                result.projectedEligibilityDate = projectedDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
                result.projectedEligibilityDateObj = projectedDate;

                if (result.ruleName === 'Regra de Transição por Pontos') {
                    const projectedYear = projectedDate.getFullYear();
                    const key = `${data.role === Role.Teacher ? 'teacher_' : ''}${data.gender}`;
                    const requiredPointsInFuture = getRequiredPoints(key, projectedYear);
                    const pointsRequirement = result.requirements.find(r => r.label.toLowerCase().includes('pontuação mínima'));

                    if (pointsRequirement && pointsRequirement.requiredValue !== requiredPointsInFuture) {
                        pointsRequirement.required = `${requiredPointsInFuture} pontos (em ${projectedYear})`;
                        pointsRequirement.requiredValue = requiredPointsInFuture;
                        
                        // Clear any missing text for points to respect user request
                        delete pointsRequirement.missing;
                    }

                    // Recalcula a remuneração projetada para a regra de pontos
                    // Idade fixa 65/60 sem redução para professor na paridade
                    const isPre2003 = new Date(data.entryDate) <= EC41_DATE;
                    const requiredParityAge = data.gender === Gender.Male ? 65 : 60;
                    const daysUntilProjection = daysBetween(today, projectedDate);
                    const projectedAgeInYears = (ageInDaysToday + daysUntilProjection) / Y;
                    
                    if (isPre2003) {
                        if (projectedAgeInYears >= requiredParityAge) {
                            result.remuneration = 'Integralidade e Paridade';
                        } else {
                            result.remuneration = `Média das contribuições (Integralidade apenas aos ${requiredParityAge} anos)`;
                        }
                    }
                }
            } else {
                result.projectedEligibilityDate = "Projeção superior a 40 anos.";
            }
        }
        return result;
    });

    const compulsoryRule = checkCompulsoryRule(data, today, ageInDaysToday, contributionDaysUpToToday);
    if (!compulsoryRule.eligible) {
        const birthDate = parseDate(data.birthDate);
        const minAgeDays = getDaysToAge(birthDate, MIN_AGE_COMPULSORY);
        const daysToCompulsory = (minAgeDays + 1) - ageInDaysToday;
        const projectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysToCompulsory));
        compulsoryRule.projectedEligibilityDate = projectedDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
        compulsoryRule.projectedEligibilityDateObj = projectedDate;
    }
    rules.push(compulsoryRule);


    let eligibleForAbono = false;
    if (data.hasFeriasPremio && data.feriasPremioDays && data.feriasPremioDays > 0) {
        const dataWithoutFerias = { ...data, hasFeriasPremio: false, feriasPremioDays: 0 };
        const resultWithoutFerias = analyzeRetirement(dataWithoutFerias);
        eligibleForAbono = resultWithoutFerias.rules.some(r => r.eligible && r.ruleName !== 'Aposentadoria Compulsória');
    } else {
        eligibleForAbono = rules.some(r => r.eligible && r.ruleName !== 'Aposentadoria Compulsória');
    }

    return {
        userName: data.name,
        userMasp: data.masp,
        userAdmissionNumber: data.admissionNumber,
        calculatedOn: today.toLocaleDateString('pt-BR'),
        rules: rules.sort((a, b) => (a.eligible === b.eligible ? 0 : a.eligible ? -1 : 1)),
        feriasPremioIncluded: feriasPremioIncluded > 0 ? feriasPremioIncluded : undefined,
        eligibleForAbono,
    };
};
