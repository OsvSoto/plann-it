CREATE TABLE public.push_token (
  push_token_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  push_token_usuario_id uuid NOT NULL REFERENCES public.usuario(usuario_id) ON DELETE CASCADE,
  push_token_token      text NOT NULL,
  push_token_creado     timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (push_token_usuario_id, push_token_token)
);

GRANT ALL ON public.push_token TO authenticated;
GRANT ALL ON public.push_token TO service_role;

ALTER TABLE public.push_token ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_token_select_own ON public.push_token
  FOR SELECT
  USING (auth.uid() = push_token_usuario_id);

CREATE POLICY push_token_insert_own ON public.push_token
  FOR INSERT
  WITH CHECK (auth.uid() = push_token_usuario_id);

CREATE POLICY push_token_delete_own ON public.push_token
  FOR DELETE
  USING (auth.uid() = push_token_usuario_id);
