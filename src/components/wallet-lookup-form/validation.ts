import { z } from "zod";
import { zfd } from "zod-form-data";

export const formSchema = zfd.formData({
  walletAddress: zfd.text(z.string().min(1)),
});
