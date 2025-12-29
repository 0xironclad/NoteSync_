import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { FieldValues, useForm } from "react-hook-form";
import "../../styles/Auth.css"
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";





function Login() {

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
    const navigate = useNavigate();
    const onSubmit = async (data: FieldValues) => {
        try {
            const response = await axios.post("http://localhost:8000/register", {
                username: data.username,
                email: data.email,
                password: data.password
            });
            console.log(response.data);
            navigate("/login");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("Axios Error:  ", error.response?.data);
            } else {
                console.log("Unexpected Error: ", error);
            }
        } finally {
            reset();
            console.log("Request completed");
        }

    }
    return (
        <div className="authContainer" >
            <div className="content d-flex justify-content-center align-items-center">
                <Card className="loginCard">
                    <CardHeader className="loginHeader">
                        <CardTitle style={{ color: "rgb(0, 209, 205)"}}>Create account</CardTitle>
                        <CardDescription>
                            Welcome to our platform!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="cardContent">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Input placeholder="Username"
                                type="text"
                                {
                                ...register("username", {
                                    required: "Username is required",
                                    minLength: {
                                        value: 3,
                                        message: "Username must be at least 3 characters"
                                    }
                                })
                                }
                            />
                            {errors.username && <CardDescription className="error">{`${errors.username.message}`}</CardDescription>}
                            <Input placeholder="Email"
                                {
                                ...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                                        message: "Invalid email format"
                                    }
                                })
                                }
                                type="email"
                            />
                            {errors.email && <CardDescription className="error">{`${errors.email.message}`}</CardDescription>}
                            <br />
                            <Input placeholder="Password"
                                {
                                ...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })
                                }
                                type="password"
                            />
                            {errors.password && <CardDescription className="error">{`${errors.password.message}`}</CardDescription>}

                        </form>
                        <br />
                        <button className="logInBtn"
                            disabled={isSubmitting}
                            onClick={handleSubmit(onSubmit)}
                        >Register</button>
                        <br />
                        <div className="or">
                            <div className="hrContainer"><hr /></div>
                            <CardDescription>Or</CardDescription>
                            <div className="hrContainer"><hr /></div>
                        </div>
                        <div className="icons">
                            <FcGoogle />
                            <FaFacebook />
                            <FaGithub />
                        </div>
                    </CardContent>
                    <CardFooter className="cardFooter">
                        <CardDescription>
                            Already have an account?
                            <span className="switch"><Link to="/login">Log in</Link></span></CardDescription>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default Login
