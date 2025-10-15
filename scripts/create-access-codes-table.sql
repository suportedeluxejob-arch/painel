-- Script para criar códigos de acesso no Firebase Realtime Database
-- Este script deve ser executado manualmente no console do Firebase ou via API

-- Estrutura de dados para access_codes:
-- access_codes/
--   {code}/
--     code: string
--     used: boolean
--     createdAt: timestamp
--     expiresAt: timestamp (opcional)
--     usedAt: timestamp (opcional)

-- Exemplo de código de acesso:
-- Código: PANEL7VIP2024
-- Status: Não usado
-- Sem expiração

-- Para adicionar códigos manualmente no Firebase Console:
-- 1. Acesse Firebase Console > Realtime Database
-- 2. Navegue até a raiz do banco
-- 3. Adicione um novo nó chamado "access_codes"
-- 4. Dentro de "access_codes", adicione códigos como:

-- access_codes/
--   PANEL7VIP2024/
--     code: "PANEL7VIP2024"
--     used: false
--     createdAt: "2024-01-15T00:00:00.000Z"
--   ANOXQUI2024/
--     code: "ANOXQUI2024"
--     used: false
--     createdAt: "2024-01-15T00:00:00.000Z"
--   BETA7ACCESS/
--     code: "BETA7ACCESS"
--     used: false
--     createdAt: "2024-01-15T00:00:00.000Z"
