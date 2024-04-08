import { z } from "zod";
import { zfd } from "zod-form-data";

export const form_schema = zfd.formData({
  wallet_address: zfd.text(z.string().min(1)),
});
