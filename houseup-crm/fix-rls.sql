-- ============================================================
-- fix-rls.sql — Garante que usuários autenticados podem ler
-- e escrever nas tabelas do HouseUp CRM
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- --------------------------------------------------------
-- Tabela: leads
-- --------------------------------------------------------
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ver leads" ON leads;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir leads" ON leads;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar leads" ON leads;

CREATE POLICY "Usuários autenticados podem ver leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir leads" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar leads" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- --------------------------------------------------------
-- Tabela: users_profiles
-- --------------------------------------------------------
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON users_profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir perfis" ON users_profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar perfis" ON users_profiles;

CREATE POLICY "Usuários autenticados podem ver perfis" ON users_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir perfis" ON users_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar perfis" ON users_profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- --------------------------------------------------------
-- Tabela: interacoes
-- --------------------------------------------------------
ALTER TABLE interacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ver interações" ON interacoes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir interações" ON interacoes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar interações" ON interacoes;

CREATE POLICY "Usuários autenticados podem ver interações" ON interacoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir interações" ON interacoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar interações" ON interacoes
  FOR UPDATE USING (auth.role() = 'authenticated');
