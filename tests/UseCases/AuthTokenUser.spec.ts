import { Test, TestingModule } from "@nestjs/testing";
import UserRepository, { UserRepositoryPort } from "src/Repositories/Users.repository";
import Validator from "src/Utils/Validator";
import AuthRegisterUseCase, { AuthRegisterDTO, AuthRegisterUseCasePort } from "src/UseCases/AuthRegister.useCase";
import UserDeleteUseCase, { UserDeleteUseCasePort } from "src/UseCases/UserDeleteUseCase.useCase";
import AuthTokenUserUseCase, { AuthTokenUserUseCasePort } from "src/UseCases/AuthTokenUser.useCase";

describe("Test AuthLoginUseCase", () => {
    let authRegisterUseCase: AuthRegisterUseCasePort;
    let authTokenUserUseCase: AuthTokenUserUseCasePort;
    let deleteUserByEmail: UserDeleteUseCasePort;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
            providers: [
                {
                    inject: [],
                    provide: "UserRepositoryPort",
                    useFactory: () => {
                        return new UserRepository();
                    },
                },
                {
                    provide: "UserDeleteUseCasePort",
                    inject: ["UserRepositoryPort"],
                    useFactory: (userRepository: UserRepositoryPort) => {
                        return new UserDeleteUseCase(userRepository);
                    },
                },
                {
                    provide: "AuthRegisterUseCasePort",
                    inject: ["UserRepositoryPort"],
                    useFactory: (userRepository: UserRepositoryPort) => {
                        return new AuthRegisterUseCase(userRepository);
                    },
                },
                {
                    provide: "AuthTokenUserUseCasePort",
                    inject: ["UserRepositoryPort"],
                    useFactory: (userRepository: UserRepositoryPort) => {
                        return new AuthTokenUserUseCase(userRepository);
                    },
                },
            ],
        }).compile();
        authRegisterUseCase = module.get<AuthRegisterUseCasePort>("AuthRegisterUseCasePort");
        authTokenUserUseCase = module.get<AuthTokenUserUseCasePort>("AuthTokenUserUseCasePort");
        deleteUserByEmail = module.get<UserDeleteUseCasePort>("UserDeleteUseCasePort");
    });

    const userEmail = Validator.email.generate();
    const userPassword = Validator.password.generate();
    const username = "Testing TokenUser Test";
    let loginToken = null;

    it("should register a user", async () => {
        const authRegisterDTO: AuthRegisterDTO = {
            username,
            email: userEmail,
			telegramNumber: Validator.phone.generate(),
            password: userPassword,
        };
        const { success, jwt_token } = await authRegisterUseCase.execute(authRegisterDTO);
        loginToken = jwt_token;

        expect(success).toBeTruthy();
        expect(jwt_token).toBeDefined();
    });

    it("should check token and return user", async () => {
        const { success, data } = await authTokenUserUseCase.execute(loginToken);

        expect(success).toBeTruthy();
        expect(data.username).toBe(username);
        expect(data.email).toBe(userEmail);
        expect(data.jwt_token).toBe(loginToken);
    });

    afterAll(async () => {
        await deleteUserByEmail.execute(userEmail);
    });
});
