import {useUserContext} from "@/contexts/UserContext";
import api from "@/services/api";
import {login} from "@/services/auth";
import {useRouter} from "next/router";
import {toast} from "react-toastify";
import {z} from "zod";

export default function RegisterForm({toggleForm}: {toggleForm: () => void}) {
  const {setUser} = useUserContext();
  const router = useRouter();
  const formSchema = z
    .object({
      name: z
        .string()
        .min(1, "Por favor preencha o nome completo")
        .max(100, "O nome completo é maior que o permitido"),
      email: z
        .string()
        .email("Email inválido")
        .min(1, "Por favor preencha o email"),
      password: z.string().min(1, "Por favor preencha a senha"),
      passwordConfirmation: z.string().min(1, "Por favor confirme a senha"),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      path: ["confirmPassword"],
      message: "As senhas não conferem",
    });

  type formBody = z.infer<typeof formSchema>;

  const handleOnSubmit = async (event: any) => {
    event.preventDefault();

    const data: formBody = {
      email: event.target.email.value,
      name: event.target.name.value,
      password: event.target.password.value,
      passwordConfirmation: event.target.passwordConfirmation.value,
    };

    try {
      formSchema.parse(data);
    } catch (err) {
      let message = "Formulário inválido";
      if (err instanceof z.ZodError) {
        const firstError: any = Object.values(err.format()).pop();
        message = firstError?._errors.pop() || message;
      }
      toast.error(message);

      return;
    }

    api
      .post("/user", data)
      .then((response) => {
        toast.success("Criado com sucesso");

        const loginData = {
          email: data.email,
          password: data.password,
        };

        api.post("/user/login", loginData).then((loginResponse) => {
          login(
            loginResponse.data.token,
            loginData.email,
            loginResponse.data.user.id
          );
          setUser({...loginResponse.data.user});
          router.push("/");
        });
      })
      .catch((err) => {
        const message =
          err.response.data?.message || "Ocorreu um erro ao acessar o servidor";

        toast.error(message);
      });
  };

  return (
    <section className="w-[300px] sm:w-[500px]">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl">
            Crie uma conta
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleOnSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Seu email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="bg-slate-100 border border-gray-300 text-slate-700 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="nome@dominio.com"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Seu nome completo
              </label>
              <input
                type="name"
                name="name"
                id="name"
                required
                className="bg-slate-100 border border-gray-300 text-slate-700 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="João Silva"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Sua senha
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                placeholder="••••••••"
                className="bg-slate-100 border border-gray-300 text-slate-700 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              />
            </div>
            <div>
              <label
                htmlFor="passwordConfirmation"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Confirme sua senha
              </label>
              <input
                type="password"
                name="passwordConfirmation"
                id="passwordConfirmation"
                required
                placeholder="••••••••"
                className="bg-slate-100 border border-gray-300 text-slate-700 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full text-white bg-orange-400 focus:ring-2 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Criar uma conta
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Já tem uma conta?{" "}
              <button
                onClick={toggleForm}
                type="submit"
                className="font-medium text-orange-500 hover:underline"
              >
                Faça login
              </button>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
