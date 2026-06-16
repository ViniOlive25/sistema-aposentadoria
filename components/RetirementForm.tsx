import React, { useState } from 'react';
import { UserData, Gender, Role, DisabilityDegree } from '../types';
import { EC20_DATE } from '../constants';

interface RetirementFormProps {
  onSubmit: (data: UserData) => void;
  isLoading: boolean;
}

const RetirementForm: React.FC<RetirementFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<UserData, 'entryDatePre1998'>>({
    name: '',
    masp: '',
    admissionNumber: '',
    gender: Gender.Female,
    role: Role.Administrative,
    birthDate: '',
    entryDate: '',
    contributionDays_2020: 0,
    contributionDays_today: 0,
    hasAveragedTime: false,
    averagedTimeInDays: 0,
    disabilityDegree: DisabilityDegree.None,
    hasFeriasPremio: false,
    feriasPremioDays: 0,
  });

  const [isFeriasExpanded, setIsFeriasExpanded] = useState(false);

  const entryDateObj = formData.entryDate ? new Date(formData.entryDate) : null;
  const today = new Date();
  const sixtyYearsAgo = new Date();
  sixtyYearsAgo.setFullYear(today.getFullYear() - 60);

  const isEntryDateValid = (formData.entryDate && formData.entryDate.length === 10) && 
    entryDateObj && 
    entryDateObj.toString() !== 'Invalid Date' && 
    entryDateObj >= sixtyYearsAgo && 
    entryDateObj <= today;

  const isPre1998 = isEntryDateValid ? entryDateObj! <= EC20_DATE : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'hasAveragedTime') {
        const hasTime = value === 'yes';
        setFormData(prev => ({
            ...prev,
            hasAveragedTime: hasTime,
            averagedTimeInDays: hasTime ? prev.averagedTimeInDays : 0,
        }));
        return;
    }

    if (name === 'hasFeriasPremio') {
      const hasFerias = value === 'yes';
      setFormData(prev => ({
          ...prev,
          hasFeriasPremio: hasFerias,
          feriasPremioDays: hasFerias ? prev.feriasPremioDays : 0,
      }));
      return;
    }

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? Number(value) : 0) : value,
        }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logical validation for provided data
    if (formData.entryDate && formData.birthDate) {
      const entryDateObj = new Date(formData.entryDate);
      const birthDateObj = new Date(formData.birthDate);
      if (entryDateObj < birthDateObj) {
        alert("A data de ingresso não pode ser anterior à data de nascimento.");
        return;
      }
    }

    if (formData.contributionDays_today > 0 && formData.contributionDays_today < formData.contributionDays_2020) {
      alert("O tempo de contribuição atual não pode ser menor que o tempo até 2020.");
      return;
    }

    const fullData: UserData = {
      ...formData,
      entryDatePre1998: isPre1998,
      averagedTimeInDays: formData.hasAveragedTime ? formData.averagedTimeInDays : 0,
      feriasPremioDays: (isPre1998 && formData.hasFeriasPremio) ? formData.feriasPremioDays : 0,
    };
    onSubmit(fullData);
  };
  
  const inputStyle = "w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const labelStyle = "block text-sm font-medium text-slate-700 mb-1";


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-center text-slate-800 mb-6">Informações do Servidor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className={labelStyle}>Nome Completo</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputStyle} required placeholder="Ex: João da Silva" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <label htmlFor="masp" className={labelStyle}>MASP</label>
            <input type="text" id="masp" name="masp" value={formData.masp} onChange={handleChange} className={inputStyle} required placeholder="Ex: 1234567-8" />
          </div>
          <div>
            <label htmlFor="admissionNumber" className={labelStyle}>Adm.</label>
            <input type="text" id="admissionNumber" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} className={inputStyle} placeholder="Nº" maxLength={2} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="gender" className={labelStyle}>Sexo</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputStyle}>
            <option value={Gender.Female}>Feminino</option>
            <option value={Gender.Male}>Masculino</option>
          </select>
        </div>
        <div>
          <label htmlFor="role" className={labelStyle}>Cargo</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputStyle}>
            <option value={Role.Administrative}>Administrativo</option>
            <option value={Role.Teacher}>Professor(a)</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="birthDate" className={labelStyle}>Data de Nascimento</label>
          <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} className={inputStyle} required />
        </div>
        <div>
          <label htmlFor="entryDate" className={labelStyle}>Ingresso em cargo efetivo no Estado de Minas Gerais</label>
          <input type="date" id="entryDate" name="entryDate" value={formData.entryDate} onChange={handleChange} className={inputStyle} required />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="contributionDays_2020" className={labelStyle}>Tempo de Contribuição até 15/09/2020 (dias)</label>
            <input type="number" id="contributionDays_2020" name="contributionDays_2020" value={formData.contributionDays_2020} onChange={handleChange} className={inputStyle} placeholder="Ex: 10180" min="0" />
        </div>
        <div>
            <label htmlFor="contributionDays_today" className={labelStyle}>Tempo de Contribuição até Hoje (dias)</label>
            <input type="number" id="contributionDays_today" name="contributionDays_today" value={formData.contributionDays_today} onChange={handleChange} className={inputStyle} placeholder="Ex: 11545" min="0" />
        </div>
      </div>
      
      <p className="text-xs text-center text-slate-500 -mt-4">
        Se os campos de tempo de contribuição forem deixados em branco, o cálculo será feito com base na Data de Ingresso.
      </p>

      <div className="pt-4 border-t border-slate-200">
         <h3 className="text-lg font-medium text-slate-800 mb-4">Tempo Averbado / Vinculado</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hasAveragedTime" className={labelStyle}>Possui tempo averbado e/ou vinculado além do informado acima?</label>
              <select 
                id="hasAveragedTime" 
                name="hasAveragedTime" 
                value={formData.hasAveragedTime ? 'yes' : 'no'} 
                onChange={handleChange} 
                className={inputStyle}
              >
                <option value="no">Não</option>
                <option value="yes">Sim</option>
              </select>
            </div>
            {formData.hasAveragedTime && (
                <div>
                    <label htmlFor="averagedTimeInDays" className={labelStyle}>Se sim: Quantos dias? (somar tempo averbado e vinculado)</label>
                    <input type="number" id="averagedTimeInDays" name="averagedTimeInDays" value={formData.averagedTimeInDays} onChange={handleChange} className={inputStyle} placeholder="Ex: 3650" min="0" />
                </div>
            )}
         </div>
      </div>

      {isPre1998 && (
        <div className="pt-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={() => setIsFeriasExpanded(!isFeriasExpanded)}
            className="flex items-center justify-between w-full text-left group py-2"
          >
            <div className="flex items-center gap-2">
              <div className={`w-1 h-4 ${formData.hasFeriasPremio ? 'bg-amber-400' : 'bg-slate-300'} rounded-full transition-colors`}></div>
              <h3 className="text-sm font-medium text-slate-700 group-hover:text-amber-700 transition-colors">
                Férias Prêmio em Dobro
                {formData.hasFeriasPremio && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Ativado</span>}
              </h3>
            </div>
            <svg 
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isFeriasExpanded ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isFeriasExpanded && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
              <div>
                <label htmlFor="hasFeriasPremio" className="block text-xs font-medium text-amber-800 mb-1">
                  Possui férias prêmio em dobro com vigência até 16/12/98 para ser utilizada?
                </label>
                <select 
                  id="hasFeriasPremio" 
                  name="hasFeriasPremio" 
                  value={formData.hasFeriasPremio ? 'yes' : 'no'} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                >
                  <option value="no">Não</option>
                  <option value="yes">Sim</option>
                </select>
              </div>
              {formData.hasFeriasPremio && (
                <div>
                  <label htmlFor="feriasPremioDays" className="block text-xs font-medium text-amber-800 mb-1">
                    Quanto tempo (saldo em dias) será utilizado?
                  </label>
                  <input 
                    type="number" 
                    id="feriasPremioDays" 
                    name="feriasPremioDays" 
                    value={formData.feriasPremioDays} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    placeholder="Ex: 90" 
                    min="0" 
                  />
                  <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Este tempo será contado em dobro para fins de aposentadoria.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}



      <div className="no-print">
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisando...
            </>
          ) : (
            'Analisar Aposentadoria'
          )}
        </button>
      </div>
    </form>
  );
};

export default RetirementForm;