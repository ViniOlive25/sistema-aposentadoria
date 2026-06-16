
import React from 'react';
import { RuleResult, RequirementStatus } from '../types';

interface RuleCardProps {
  rule: RuleResult;
  isClosest?: boolean;
}

const getProgressColorClass = (progress: number, isGradient: boolean = false, isVestedRights: boolean = false): string => {
    if (isVestedRights && progress < 100) return isGradient ? 'from-red-400 to-red-600' : 'bg-red-500';
    if (progress < 40) return isGradient ? 'from-red-400 to-red-600' : 'bg-red-500';
    if (progress < 80) return isGradient ? 'from-yellow-400 to-yellow-600' : 'bg-yellow-500';
    return isGradient ? 'from-green-400 to-green-600' : 'bg-green-500';
};

const RequirementProgress: React.FC<{ item: RequirementStatus, isVestedRights: boolean }> = ({ item, isVestedRights }) => {
    if (item.met || typeof item.currentValue === 'undefined' || typeof item.requiredValue === 'undefined' || item.requiredValue <= 0) {
        return null;
    }

    const progress = Math.min((item.currentValue / item.requiredValue) * 100, 100);
    const progressColorClass = getProgressColorClass(progress, false, isVestedRights);

    return (
        <div className={`mt-2 pt-2 border-t ${isVestedRights ? 'border-red-200' : 'border-orange-200'}`}>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progresso do Requisito</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 requirement-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso do requisito ${item.label}`}>
                <div
                    className={`${progressColorClass} h-2 rounded-full transition-all duration-500 ease-out requirement-progress-bar-fill`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

const RequirementItem: React.FC<{ item: RequirementStatus, isVestedRights: boolean }> = ({ item, isVestedRights }) => {
    const statusColor = item.met ? 'text-green-600' : (isVestedRights ? 'text-red-600' : 'text-orange-600');
    const Icon = item.met 
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

    return (
        <li className={`flex items-start p-3 rounded-lg ${item.met ? 'bg-green-50' : (isVestedRights ? 'bg-red-50' : 'bg-orange-50')}`}>
            <span className={statusColor}>{Icon}</span>
            <div className="flex-grow">
                <span className="font-semibold text-slate-700">{item.label}:</span>
                <span className="text-slate-600 ml-2">{item.required}</span>
                <div className={`text-sm ${statusColor}`}>
                    <span className="font-medium">Status:</span> {item.met ? 'Requisito cumprido' : 'Requisito pendente'} (Atual: {item.current})
                </div>
                 {!item.met && item.missing && (
                    <div className={`text-sm ${isVestedRights ? 'text-red-800' : 'text-orange-800'} font-bold mt-1`}>
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
  const cardBorderColor = rule.eligible ? 'border-green-500' : (isVestedRights ? 'border-red-500' : 'border-slate-300');
  const headerBgColor = rule.eligible ? 'bg-green-100' : (isVestedRights ? 'bg-red-100' : 'bg-slate-100');
  const headerTextColor = rule.eligible ? 'text-green-800' : (isVestedRights ? 'text-red-800' : 'text-slate-800');
  const overallProgress = rule.overallProgress ?? 0;
  const overallProgressColorClass = getProgressColorClass(overallProgress, true, isVestedRights);
  
  return (
    <div className={`relative border-2 ${cardBorderColor} rounded-xl shadow-md overflow-hidden bg-white rule-card-container`}>
      {isClosest && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 no-print">
          MAIS PRÓXIMA
        </div>
      )}
      <div className={`p-4 ${headerBgColor} rule-card-header`}>
        <h3 className={`text-lg font-bold ${headerTextColor}`}>{rule.ruleName}</h3>
        <p className="text-sm text-slate-600">{rule.description}</p>
      </div>

      {!rule.eligible && overallProgress < 100 && (
          <div className="p-4 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">Progresso Geral para Elegibilidade</h4>
              <div className="flex items-center">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 flex-grow overall-progress-bar" role="progressbar" aria-valuenow={overallProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso geral da regra">
                      <div
                          className={`bg-gradient-to-r ${overallProgressColorClass} h-2.5 rounded-full transition-all duration-500 ease-out overall-progress-bar-fill`}
                          style={{ width: `${overallProgress}%` }}
                      ></div>
                  </div>
                  <span className="ml-4 font-bold text-slate-700 text-base">{overallProgress.toFixed(1)}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                  {isVestedRights ? 'Este é o progresso em relação aos requisitos que deveriam ter sido cumpridos até 15/09/2020.' : 'Esta é uma média do progresso nos requisitos que ainda não foram cumpridos.'}
              </p>
          </div>
      )}

      <div className="p-4 md:p-6 space-y-4">
        <div>
          <h4 className="font-semibold text-slate-700 mb-2">Requisitos:</h4>
          <ul className="space-y-2">
            {rule.requirements.map(req => <RequirementItem key={req.label} item={req} isVestedRights={isVestedRights} />)}
          </ul>
        </div>
        
        <div className="border-t pt-4">
            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">Tipo de Remuneração:</span>
                <span className="font-medium text-slate-700 bg-slate-200 px-2 py-1 rounded">{rule.remuneration}</span>
            </div>
        </div>

        {!rule.eligible && rule.projectedEligibilityDate && !isVestedRights && (
           <div className="border-t pt-4">
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800">Data Prevista para Aposentadoria:</p>
                    <p className="text-xl font-bold text-blue-600">{rule.projectedEligibilityDate}</p>
                </div>
           </div>
        )}

        <div className={`p-3 rounded-lg text-center font-bold text-lg ${rule.eligible ? 'bg-green-500 text-white' : (isVestedRights ? 'bg-red-500 text-white' : 'bg-orange-500 text-white')}`}>
          {rule.eligible ? 'ELEGÍVEL' : (isVestedRights ? 'NÃO ELEGÍVEL' : 'NÃO ELEGÍVEL AINDA')}
        </div>
      </div>
    </div>
  );
};

export default RuleCard;
