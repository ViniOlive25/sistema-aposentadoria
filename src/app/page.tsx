
import React, { useState, useCallback, useEffect } from 'react';
import { UserData, AnalysisResult } from '../types';
import { analyzeRetirement } from '../services/retirementCalculator';
import RetirementForm from '../components/RetirementForm';
import ResultsDisplay from '../components/ResultsDisplay';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fullscreen') === 'true') {
      setIsFullscreen(true);
    }
  }, []);

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
    <div className="min-h-screen bg-see-bg text-see-text">
      <div className="no-print">
        {!isFullscreen && <Header />}
      </div>
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {!isFullscreen && (
            <p className="text-center text-see-text-gray mb-8 no-print">
              Preencha os campos abaixo para simular as possibilidades de aposentadoria para servidores da educação de Minas Gerais.
            </p>
          )}
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

          {analysisResult && !isLoading && (
            <div className="mt-10 results-container">
              <ResultsDisplay result={analysisResult} />
            </div>
          )}
        </div>
      </main>
       <div className="no-print">
        {!isFullscreen && <Footer />}
      </div>
    </div>
  );
};

export default App;
