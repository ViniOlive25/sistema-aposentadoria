import { Header } from '@/components/Header';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simples validação - qualquer usuário/senha funciona
    if (username.trim() && password.trim()) {
      navigate('/main');
    } else {
      alert('Por favor, preencha usuário e senha');
    }
  };

  return (
    <div className="min-h-screen bg-see-bg text-see-dark font-poppins">
      {/* Header */}
      <Header />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 mt-30 mx-auto mt-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-see-dark mb-2">
            LOGIN
          </h1>
          <p className="text-md mb-4">
            Digite suas credenciais para acessar o sistema
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold mb-2">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-see-red hover:bg-see-red-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform active:scale-95"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;