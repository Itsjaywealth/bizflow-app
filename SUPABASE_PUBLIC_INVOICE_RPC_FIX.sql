begin;

create or replace function get_public_invoice(token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'invoice_number', invoice.invoice_number,
    'created_at', invoice.created_at,
    'due_date', invoice.due_date,
    'status', invoice.status,
    'currency', coalesce(invoice.currency, 'NGN'),
    'items', coalesce(invoice.items, '[]'::jsonb),
    'subtotal', invoice.subtotal,
    'tax', invoice.tax,
    'total', invoice.total,
    'amount_paid', invoice.amount_paid,
    'notes', invoice.notes,
    'business_snapshot', jsonb_build_object(
      'name', invoice.business_snapshot ->> 'name',
      'email', invoice.business_snapshot ->> 'email',
      'phone', invoice.business_snapshot ->> 'phone',
      'address', invoice.business_snapshot ->> 'address',
      'logo_url', invoice.business_snapshot ->> 'logo_url',
      'bank_name', invoice.business_snapshot ->> 'bank_name',
      'account_name', invoice.business_snapshot ->> 'account_name',
      'account_number', invoice.business_snapshot ->> 'account_number',
      'payment_link', invoice.business_snapshot ->> 'payment_link'
    ),
    'client_snapshot', jsonb_build_object(
      'name', invoice.client_snapshot ->> 'name',
      'email', invoice.client_snapshot ->> 'email',
      'phone', invoice.client_snapshot ->> 'phone',
      'address', invoice.client_snapshot ->> 'address'
    )
  )
  from invoices as invoice
  where invoice.public_token = token
  limit 1;
$$;

grant execute on function get_public_invoice(text) to anon, authenticated;

commit;
