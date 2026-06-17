
import React, { useState, useCallback, useEffect } from 'react';
import { UserData, AnalysisResult } from '../../types/types';
import { analyzeRetirement } from '../../services/retirementCalculator';
import RetirementForm from '../../components/RetirementForm';
import ResultsDisplay from '../../components/ResultsDisplay';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysisResult !== null && !isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [analysisResult, isLoading]);

  const handleAnalysis = useCallback((data: UserData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Simulate async calculation for better UX
    setTimeout(() => {
      try {
        const result = analyzeRetirement(data);
        setAnalysisResult(result);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Ocorreu um erro desconhecido durante a análise.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-see-bg text-see-text font-poppins">
      <Header />
      
      <div className="flex-grow">
        <div className="max-w-[90%] md:max-w-3xl mx-auto rounded-lg border border-see-red bg-white p-4 text-center mt-[1%]">
        <p className="font-bold text-see-red text-lg mb-2">AVISO IMPORTANTE ⚠️</p>
        <p className="text-see-dark text-sm leading-relaxed">
          Este cálculo é apenas uma estimativa, elaborado com base nas regras vigentes na data da simulação,
          as quais podem sofrer alterações.
          Dependendo da regra aplicável, podem existir especificações que influenciam o resultado.
        </p>
        <br />
        <p className="text-see text-sm leading-relaxed font-bold">
          Para um cálculo oficial, consulte o setor responsável do <span className="text-see-red">Estado de Minas Gerais</span>.
        </p>
      </div>

      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 retirement-form-container">
            <RetirementForm onSubmit={handleAnalysis} isLoading={isLoading} />
          </div>

          {isLoading && (
            <div className="text-center mt-8 no-print">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-see-gold"></div>
              <p className="mt-2 text-see-gold font-semibold">Analisando...</p>
            </div>
          )}

          {error && (
            <div className="mt-8 bg-see-red-light border-l-4 border-see-red text-see-red-dark p-4 rounded-md no-print" role="alert">
              <p className="font-bold">Erro na Análise</p>
              <p>{error}</p>
            </div>
          )}

          {analysisResult != null && !isLoading && (
            <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto">
              <div
                className='fixed inset-0 w-full h-full bg-black bg-opacity-50'
                onClick={() => setAnalysisResult(null)}
              ></div>
              <div
                className="relative w-full max-w-4xl mx-auto pt-8 pb-8 px-4 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <ResultsDisplay result={analysisResult} />
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
      <Footer />

    </div>
  );
};

export default App;
