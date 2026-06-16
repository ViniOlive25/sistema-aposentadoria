
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 pb-8">
      <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
        <p className="font-bold mb-2">⚠️ AVISO OBRIGATÓRIO ⚠️</p>
        <p className="mb-4">
          Este cálculo é apenas uma estimativa, elaborado com base nas regras vigentes na data da simulação, as quais podem sofrer alterações. Dependendo da regra aplicável, podem existir especificações que influenciam o resultado. Para um cálculo oficial, consulte o setor responsável do Estado de Minas Gerais.
        </p>
      </div>
    </footer>
  );
};
