import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-t-4 border-see-red">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-center relative min-h-[90px]">
        
        <div className="mb-3 md:mb-0 md:absolute md:left-0">
          <img 
            src="assets/logo-atualizada-gov-mg.png" 
            alt="Logo" 
            className="h-[100%] w-auto object-contain" 
          />
        </div>

        {/* Container do Texto (permanece centralizado) */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-see-text tracking-tight leading-none">
            Simulador de Aposentadoria
          </h1>
          <p className="text-see-red font-semibold tracking-wider text-[10px] md:text-xs mt-2 uppercase">
            Secretaria de Estado de Educação de Minas Gerais
          </p>
        </div>

      </div>
    </header>
  );
};