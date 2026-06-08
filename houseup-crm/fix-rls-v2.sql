-- Remove policies existentes e recria corretamente
DROP POLICY IF EXISTS "Usuários autenticados podem inserir leads" ON leads;
DROP POLICY IF EXISTS "Usuários autenticados podem ver leads" ON leads;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar leads" ON leads;

-- Desabilita RLS temporariamente para testar
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
