-- Create products table for storing product information
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_instance_id ON public.products(instance_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(product_name);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own products
CREATE POLICY "Users can manage their own products"
  ON public.products
  FOR ALL
  USING (
    instance_id IN (
      SELECT id FROM public.whatsapp_instances
      WHERE created_by = auth.uid()
    )
  );
