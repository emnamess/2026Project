import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  address: {
    street: string;
    city: string;
    governorate: string;
    postalCode: string;
  };
}

function paymentLabel(method: string) {
  return method === "cash_on_delivery" ? "Paiement à la livraison" : "Carte bancaire";
}

function orderConfirmationHtml(d: OrderEmailData): string {
  const itemRows = d.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;">
          ${item.name}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6b7280;text-align:center;">
          ×${item.quantity}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;text-align:right;font-weight:600;">
          ${(item.unitPrice * item.quantity).toFixed(2)} TND
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#111827;padding:28px 40px;">
          <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">
            Artisan.TN
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#111827;">
            Commande confirmée
          </h1>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
            Bonjour ${d.customerName}, merci pour votre commande !
          </p>

          <!-- Order number -->
          <div style="background:#f9fafb;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">
              Numéro de commande
            </p>
            <p style="margin:0;font-size:18px;font-weight:700;font-family:monospace;color:#111827;">
              ${d.orderNumber}
            </p>
          </div>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <th style="text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">
                Article
              </th>
              <th style="text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">
                Qté
              </th>
              <th style="text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">
                Prix
              </th>
            </tr>
            ${itemRows}
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Sous-total</td>
              <td style="font-size:13px;color:#6b7280;text-align:right;padding:4px 0;">${d.subtotal.toFixed(2)} TND</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Livraison</td>
              <td style="font-size:13px;color:#6b7280;text-align:right;padding:4px 0;">
                ${d.shipping === 0 ? "Gratuite" : d.shipping.toFixed(2) + " TND"}
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;font-weight:700;color:#111827;padding:12px 0 4px;border-top:2px solid #f0f0f0;">Total</td>
              <td style="font-size:15px;font-weight:700;color:#111827;text-align:right;padding:12px 0 4px;border-top:2px solid #f0f0f0;">${d.total.toFixed(2)} TND</td>
            </tr>
          </table>

          <!-- Two columns: payment + address -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48%" valign="top" style="background:#f9fafb;border-radius:6px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Paiement</p>
                <p style="margin:0;font-size:13px;color:#374151;">${paymentLabel(d.paymentMethod)}</p>
              </td>
              <td width="4%"></td>
              <td width="48%" valign="top" style="background:#f9fafb;border-radius:6px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Livraison à</p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                  ${d.address.street}<br>
                  ${d.address.postalCode} ${d.address.city}<br>
                  ${d.address.governorate}, Tunisie
                </p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            Vous avez des questions ? Répondez à cet email.<br>
            © ${new Date().getFullYear()} Artisan.TN — Fait main en Tunisie
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminAlertHtml(d: OrderEmailData): string {
  const itemList = d.items
    .map((i) => `${i.name} × ${i.quantity} — ${(i.unitPrice * i.quantity).toFixed(2)} TND`)
    .join("<br>");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:32px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:500px;background:#fff;border-radius:8px;padding:32px;border-left:4px solid #111827;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Nouvelle commande</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111827;font-family:monospace;">${d.orderNumber}</h1>

    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Client</p>
    <p style="margin:0 0 16px;font-size:15px;color:#111827;font-weight:600;">${d.customerName} &lt;${d.customerEmail}&gt;</p>

    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Articles</p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.8;">${itemList}</p>

    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Total</p>
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">${d.total.toFixed(2)} TND</p>

    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Paiement</p>
    <p style="margin:0 0 20px;font-size:14px;color:#374151;">${paymentLabel(d.paymentMethod)}</p>

    <a href="${process.env.NEXTAUTH_URL}/admin/commandes" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">
      Voir dans l'admin →
    </a>
  </div>
</body>
</html>`;
}

export async function sendOrderEmails(data: OrderEmailData) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const from = process.env.SMTP_FROM ?? `Artisan.TN <${process.env.SMTP_USER}>`;
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER;

  await Promise.allSettled([
    transporter.sendMail({
      from,
      to: data.customerEmail,
      subject: `Votre commande ${data.orderNumber} est confirmée — Artisan.TN`,
      html: orderConfirmationHtml(data),
    }),
    transporter.sendMail({
      from,
      to: adminEmail,
      subject: `Nouvelle commande ${data.orderNumber} — ${data.total.toFixed(2)} TND`,
      html: adminAlertHtml(data),
    }),
  ]);
}
