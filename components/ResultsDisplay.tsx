
import React from 'react';
import { AnalysisResult } from '../types';
import RuleCard from './RuleCard';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const eligibleRules = result.rules.filter(r => r.eligible);
  const notEligibleRules = result.rules.filter(r => !r.eligible);

  // For eligible rules, best is by remuneration type (prioritize Paridade)
  const getRemunerationRank = (remuneration: string) => {
      const lower = remuneration.toLowerCase();
      if (lower.includes('paridade')) return 1;
      if (lower.includes('integralidade')) return 2;
      if (lower.includes('média')) return 3;
      return 4;
  }
  const sortedEligibleRules = [...eligibleRules].sort((a, b) => getRemunerationRank(a.remuneration) - getRemunerationRank(b.remuneration));
  
  // For non-eligible rules, best is the one with closest projected date
  // Only show "MAIS PRÓXIMA" if no rules are currently eligible
  let closestNotEligibleRuleName: string | null = null;
  if (eligibleRules.length === 0 && notEligibleRules.length > 0) {
    const sortedByProximity = [...notEligibleRules].sort((a, b) => {
        const dateA = a.projectedEligibilityDateObj ? a.projectedEligibilityDateObj.getTime() : Infinity;
        const dateB = b.projectedEligibilityDateObj ? b.projectedEligibilityDateObj.getTime() : Infinity;
        
        if (dateA !== dateB) {
            return dateA - dateB;
        }
        
        // Fallback to progress if dates are same or both Infinity
        return (b.overallProgress ?? 0) - (a.overallProgress ?? 0);
    });
    
    closestNotEligibleRuleName = sortedByProximity[0].ruleName;
  }

  return (
    <div id="printable-area" className="space-y-8">
      <div className="relative text-center p-6 bg-slate-100 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Resultado da Simulação</h2>
        {result.userName && (
          <p className="text-lg font-semibold text-slate-700">Servidor: {result.userName}</p>
        )}
        {(result.userMasp || result.userAdmissionNumber) && (
          <p className="text-slate-600">
            {result.userMasp && `MASP: ${result.userMasp}`}
            {result.userMasp && result.userAdmissionNumber && ' / '}
            {result.userAdmissionNumber && `Admissão: ${result.userAdmissionNumber}`}
          </p>
        )}
        <p className="text-sm text-slate-500 mt-2">Calculado em: {result.calculatedOn}</p>
        {result.feriasPremioIncluded && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-medium border border-amber-200">
             <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
             </svg>
             Saldo de Férias Prêmio em dobro utilizado: {result.feriasPremioIncluded} dias
          </div>
        )}
      </div>

      {sortedEligibleRules.length > 0 && (
        <div className="space-y-6">
          {result.eligibleForAbono && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm break-inside-avoid mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-blue-800">Direito ao Abono de Permanência!</h3>
                  <p className="mt-2 text-blue-700 leading-relaxed">
                    Como você já preenche os requisitos para se aposentar em pelo menos uma regra, você tem direito a receber o <strong>Abono de Permanência</strong> se optar por continuar trabalhando. Este benefício corresponde ao valor da sua contribuição previdenciária.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div>
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-green-500 text-green-700 break-after-avoid">🎉 Parabéns! Você já possui direito à aposentadoria pelas seguintes regras:</h3>
              <div className="space-y-6">
                  {sortedEligibleRules.map((rule) => <RuleCard key={rule.ruleName} rule={rule} />)}
              </div>
          </div>
        </div>
      )}

      {notEligibleRules.length > 0 && (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-orange-500 text-orange-700 break-after-avoid">🔍 Análise das demais regras (requisitos ainda não cumpridos):</h3>
            <div className="space-y-6">
                {notEligibleRules.map(rule => <RuleCard key={rule.ruleName} rule={rule} isClosest={rule.ruleName === closestNotEligibleRuleName} />)}
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
