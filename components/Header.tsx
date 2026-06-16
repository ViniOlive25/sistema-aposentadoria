
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight leading-none text-center">
            Simulador de Aposentadoria
          </h1>
          <p className="text-blue-600 font-semibold tracking-wider text-[10px] md:text-xs mt-2 text-center uppercase">
            Secretaria de Estado de Educação de Minas Gerais
          </p>
        </div>
      </div>
    </header>
  );
};
