
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-10 w-full h-36 bg-see-dark rounded-t-[50px] border-t border-see-red-dark ">
      <div className="text-center text-lg text-white h-full flex flex-col gap-2 items-center justify-center left-0 font-bold">
        <p>
          &copy; {new Date().getFullYear()} Simulador de Aposentadoria
        </p>
        <p>
          Todos os direitos reservados
        </p>
        
      </div>
    </footer>
  );
};
