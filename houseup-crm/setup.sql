-- Habilita a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos personalizados
CREATE TYPE user_role AS ENUM ('socio', 'gestor_comercial', 'gestor_trafego');
CREATE TYPE origem_lead AS ENUM ('instagram_organico', 'trafego_pago', 'indicacao');
CREATE TYPE tipo_interesse AS ENUM ('so_projeto', 'so_obra', 'projeto_e_obra');
CREATE TYPE etapa_lead AS ENUM (
  'novo_lead',
  'qualificacao',
  'reuniao_briefing',
  'proposta_enviada',
  'negociacao',
  'fechado',
  'perdido'
);
CREATE TYPE tipo_interacao AS ENUM ('ligacao', 'whatsapp', 'email', 'reuniao', 'nota');

-- Tabela de perfis de usuários (extensão do auth.users do Supabase)
CREATE TABLE users_profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'gestor_comercial',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Tabela de leads
CREATE TABLE leads (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at      TIMESTAMPTZ DEFAULT NOW(),
  name                  TEXT NOT NULL,
  phone                 TEXT,
  instagram             TEXT,
  origem                origem_lead,
  campanha              TEXT,
  tem_terreno           BOOLEAN DEFAULT FALSE,
  localizacao_terreno   TEXT,
  tem_projeto           BOOLEAN DEFAULT FALSE,
  precisa_financiamento BOOLEAN DEFAULT FALSE,
  orcamento_desejado    NUMERIC,
  tipo_interesse        tipo_interesse,
  etapa                 etapa_lead DEFAULT 'novo_lead',
  motivo_perda          TEXT,
  responsavel_id        UUID REFERENCES users_profiles(id),
  notas                 TEXT
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Tabela de interações
CREATE TABLE interacoes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id     UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES users_profiles(id) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  tipo        tipo_interacao NOT NULL,
  descricao   TEXT NOT NULL
);

ALTER TABLE interacoes ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Políticas RLS
-- -------------------------------------------------------

-- users_profiles: todos autenticados lêem, cada um atualiza o próprio
CREATE POLICY "Usuarios podem ver todos os perfis" ON users_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios podem inserir proprio perfil" ON users_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar proprio perfil" ON users_profiles
  FOR UPDATE USING (auth.uid() = id);

-- leads: todos os autenticados têm acesso completo
CREATE POLICY "Autenticados podem ver leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem inserir leads" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem atualizar leads" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem deletar leads" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- interacoes: todos os autenticados têm acesso completo
CREATE POLICY "Autenticados podem ver interacoes" ON interacoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem inserir interacoes" ON interacoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem atualizar interacoes" ON interacoes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- -------------------------------------------------------
-- Função e trigger para atualizar updated_at automaticamente
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- Função e trigger para criar perfil ao cadastrar usuário
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'gestor_comercial'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
