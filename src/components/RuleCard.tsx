
import React from 'react';
import { RuleResult, RequirementStatus } from '../types';

interface RuleCardProps {
  rule: RuleResult;
  isClosest?: boolean;
}

const getProgressColorClass = (progress: number, isGradient: boolean = false, isVestedRights: boolean = false): string => {
    if (isVestedRights && progress < 100) return isGradient ? 'from-see-red to-see-red-dark' : 'bg-see-red';
    if (progress < 40) return isGradient ? 'from-see-red to-see-red-dark' : 'bg-see-red';
    if (progress < 80) return isGradient ? 'from-see-gold to-see-gold-dark' : 'bg-see-gold';
    return isGradient ? 'from-see-green to-see-green-dark' : 'bg-see-green';
};

const RequirementProgress: React.FC<{ item: RequirementStatus, isVestedRights: boolean }> = ({ item, isVestedRights }) => {
    if (item.met || typeof item.currentValue === 'undefined' || typeof item.requiredValue === 'undefined' || item.requiredValue <= 0) {
        return null;
    }

    const progress = Math.min((item.currentValue / item.requiredValue) * 100, 100);
    const progressColorClass = getProgressColorClass(progress, false, isVestedRights);

    return (
        <div className={`mt-2 pt-2 border-t ${isVestedRights ? 'border-see-red/30' : 'border-see-orange/30'}`}>
            <div className="flex justify-between text-xs text-see-text-gray mb-1">
                <span>Progresso do Requisito</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 requirement-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso do requisito ${item.label}`}>
                <div
                    className={`${progressColorClass} h-2 rounded-full transition-all duration-500 ease-out requirement-progress-bar-fill`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

const RequirementItem: React.FC<{ item: RequirementStatus, isVestedRights: boolean }> = ({ item, isVestedRights }) => {
    const statusColor = item.met ? 'text-see-green' : (isVestedRights ? 'text-see-red' : 'text-see-orange');
    const Icon = item.met 
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

    return (
        <li className={`flex items-start p-3 rounded-lg ${item.met ? 'bg-see-green-light' : (isVestedRights ? 'bg-see-red-light' : 'bg-see-orange-light')}`}>
            <span className={statusColor}>{Icon}</span>
            <div className="flex-grow">
                <span className="font-semibold text-see-text">{item.label}:</span>
                <span className="text-see-text-gray ml-2">{item.required}</span>
                <div className={`text-sm ${statusColor}`}>
                    <span className="font-medium">Status:</span> {item.met ? 'Requisito cumprido' : 'Requisito pendente'} (Atual: {item.current})
                </div>
                 {!item.met && item.missing && (
                    <div className={`text-sm ${isVestedRights ? 'text-see-red-dark' : 'text-see-orange-dark'} font-bold mt-1`}>
                        {isVestedRights ? 'Faltava na época: ' : 'Falta: '}{item.missing}
                    </div>
                )}
                <RequirementProgress item={item} isVestedRights={isVestedRights} />
            </div>
        </li>
    );
};


const RuleCard: React.FC<RuleCardProps> = ({ rule, isClosest = false }) => {
  const isVestedRights = rule.ruleName.includes('Direito Adquirido');
  const cardBorderColor = rule.eligible ? 'border-see-green' : (isVestedRights ? 'border-see-red' : 'border-gray-300');
  const headerBgColor = rule.eligible ? 'bg-see-green-light' : (isVestedRights ? 'bg-see-red-light' : 'bg-see-bg');
  const headerTextColor = rule.eligible ? 'text-see-green-dark' : (isVestedRights ? 'text-see-red-dark' : 'text-see-text');
  const overallProgress = rule.overallProgress ?? 0;
  const overallProgressColorClass = getProgressColorClass(overallProgress, true, isVestedRights);
  
  return (
    <div className={`relative border-2 ${cardBorderColor} rounded-xl shadow-md overflow-hidden bg-white rule-card-container`}>
      {isClosest && (
        <div className="absolute top-0 right-0 bg-see-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 no-print">
          MAIS PRÓXIMA
        </div>
      )}
      <div className={`p-4 ${headerBgColor} rule-card-header`}>
        <h3 className={`text-lg font-bold ${headerTextColor}`}>{rule.ruleName}</h3>
        <p className="text-sm text-slate-600">{rule.description}</p>
      </div>

      {!rule.eligible && overallProgress < 100 && (
          <div className="p-4 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-see-text-gray mb-2">Progresso Geral para Elegibilidade</h4>
              <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 flex-grow overall-progress-bar" role="progressbar" aria-valuenow={overallProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso geral da regra">
                      <div
                          className={`bg-gradient-to-r ${overallProgressColorClass} h-2.5 rounded-full transition-all duration-500 ease-out overall-progress-bar-fill`}
                          style={{ width: `${overallProgress}%` }}
                      ></div>
                  </div>
                  <span className="ml-4 font-bold text-see-text text-base">{overallProgress.toFixed(1)}%</span>
              </div>
              <p className="text-xs text-see-text-gray mt-1.5">
                  {isVestedRights ? 'Este é o progresso em relação aos requisitos que deveriam ter sido cumpridos até 15/09/2020.' : 'Esta é uma média do progresso nos requisitos que ainda não foram cumpridos.'}
              </p>
          </div>
      )}

      <div className="p-4 md:p-6 space-y-4">
        <div>
          <h4 className="font-semibold text-see-text mb-2">Requisitos:</h4>
          <ul className="space-y-2">
            {rule.requirements.map(req => <RequirementItem key={req.label} item={req} isVestedRights={isVestedRights} />)}
          </ul>
        </div>
        
        <div className="border-t pt-4">
            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-see-text-gray">Tipo de Remuneração:</span>
                <span className="font-medium text-see-text bg-gray-200 px-2 py-1 rounded">{rule.remuneration}</span>
            </div>
        </div>

        {!rule.eligible && rule.projectedEligibilityDate && !isVestedRights && (
           <div className="border-t pt-4">
                <div className="text-center p-3 bg-see-blue-light border border-see-blue/30 rounded-lg">
                    <p className="text-sm font-semibold text-see-blue-dark">Data Prevista para Aposentadoria:</p>
                    <p className="text-xl font-bold text-see-blue">{rule.projectedEligibilityDate}</p>
                </div>
           </div>
        )}

        <div className={`p-3 rounded-lg text-center font-bold text-lg ${rule.eligible ? 'bg-see-green text-white' : (isVestedRights ? 'bg-see-red text-white' : 'bg-see-orange text-white')}`}>
          {rule.eligible ? 'ELEGÍVEL' : (isVestedRights ? 'NÃO ELEGÍVEL' : 'NÃO ELEGÍVEL AINDA')}
        </div>
      </div>
    </div>
  );
};

export default RuleCard;
