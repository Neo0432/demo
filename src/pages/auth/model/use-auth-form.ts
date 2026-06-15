import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP } from "@shared/constants/regexp";
import { useForm } from "react-hook-form";
import { z } from "zod";

const INVALID_PASSWORD_FIELD_ERROR = "Невалидный пароль";
const PASSWORD_MAX_CHARACTERS = "Пароль слишком длинный";

const INVALID_EMAIL_FIELD_ERROR = "Невалидный email";

const REQUIRED_FIELD = "Это обязательное поле";

export const FIELDS_RESTRICTIONS = {
  password: {
    min: 1,
    max: 64,
  },
};

export const passwordRules = z.object({
  length: z.string().min(8, INVALID_PASSWORD_FIELD_ERROR),
  letters: z.string().regex(REGEXP.letters, INVALID_PASSWORD_FIELD_ERROR),
  number: z.string().regex(REGEXP.number, INVALID_PASSWORD_FIELD_ERROR),
  specSymbols: z
    .string()
    .regex(REGEXP.specSymbols, INVALID_PASSWORD_FIELD_ERROR),
});

export const authFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, REQUIRED_FIELD)
    .email(INVALID_EMAIL_FIELD_ERROR),
  password: z
    .string()
    .trim()
    .min(FIELDS_RESTRICTIONS.password.min, REQUIRED_FIELD)
    .max(FIELDS_RESTRICTIONS.password.max, PASSWORD_MAX_CHARACTERS)
    .min(8, INVALID_PASSWORD_FIELD_ERROR)
    .regex(REGEXP.letters, INVALID_PASSWORD_FIELD_ERROR)
    .regex(REGEXP.number, INVALID_PASSWORD_FIELD_ERROR)
    .regex(REGEXP.specSymbols, INVALID_PASSWORD_FIELD_ERROR),
});

export type AuthFormType = z.infer<typeof authFormSchema>;

export const useAuthForm = () => {
  return useForm<AuthFormType>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(authFormSchema),
  });
};
