import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-t-4 border-see-red">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between min-h-[120px] gap-4">
        
        <div className="flex-shrink-0 2xl:absolute 2xl:left-3">
          <img 
            src="assets/logo-atualizada-gov-mg.png" 
            alt="Logo" 
            className="h-[100%] w-auto object-contain" 
          />
        </div>

        <div className="flex flex-col items-center text-center sm:flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-see-dark tracking-tight leading-none">
            SIMULADOR DE APOSENTADORIA
          </h1>
          <p className="text-see-red font-semibold tracking-wider text-[15px] mt-2 uppercase">
            SECRETARIA DE ESTADO DE EDUCAÇÃO DE MINAS GERAIS
          </p>
        </div>

      </div>
    </header>
  );
};