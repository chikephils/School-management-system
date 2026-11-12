import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/store/hooks";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import { loginSuccess } from "../store/authSlice";
import { loginUser } from "../api/authApi";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await loginUser(values);
      dispatch(loginSuccess(data));
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const demoAccounts = [
    {
      role: "Super Admin",
      email: "superadmin@chirevaedu.com",
      password: "password123",
    },
    {
      role: "Admin",
      email: "fgmscAdmin@chirevaedu.com",
      password: "chireva",
    },
    {
      role: "Dept-Admin",
      email: "accAdmin@chirevaedu.com",
      password: "chireva",
    },
    {
      role: "Lecturer",
      email: "LECFART1@chirevaedu.com",
      password: "chireva",
    },
    {
      role: "Student",
      email: "Philips@chireva.edu",
      password: "chireva",
    },
  ];
  const fillDemoCredentials = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="='w-full max-w-md">
        <div>
          <p className="text-sm font-bold uppercase text-blue-700">
            {" "}
            School Management System
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950"> Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Access your student, lecturer or admin dashboard
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email address"
            type="email"
            placeholder="Enter your login email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            className="w-full cursor-pointer"
            isLoading={isSubmitting}
          >
            Sign in
          </Button>

          {/* Demo Accounts */}
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Explore Demo Accounts
              </h3>
              <p className="text-xs text-slate-600">
                Select a role to automatically fill in the login credentials.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() =>
                    fillDemoCredentials(account.email, account.password)
                  }
                  className="rounded-md border border-blue-200 bg-white px-1 py-2 text-xs font-black hover:border-blue-500 hover:bg-blue-100 cursor-pointer drop-shadow-lg"
                >
                  {account.role}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Demo access is provided for evaluation purposes.
            </p>
          </div>

          <p className="text-center text-sm text-slate-600">
            New student?{" "}
            <Link
              className="font-semibold text-blue-700"
              to="/register-student"
            >
              Create admission account
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}

export default LoginPage;
