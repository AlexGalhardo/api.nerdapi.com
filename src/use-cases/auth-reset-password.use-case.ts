import { UsersRepositoryPort } from "../repositories/users.repository.js";
import { Bcrypt } from "../utils/bcrypt.util.js";
import { ErrorsMessages } from "../utils/errors-messages.util.js";
import { ClientException } from "../utils/exceptions.util.js";
import PasswordValidator from "../validators/password.validator.js";

export interface AuthResetPasswordUseCasePort {
    execute(
        resetPasswordToken: string,
        authResetPasswordDTO: AuthResetPasswordDTO,
    ): Promise<AuthResetPasswordUseCaseResponse>;
}

export interface AuthResetPasswordDTO {
    newPassword: string;
    confirmNewPassword: string;
}

interface AuthResetPasswordUseCaseResponse {
    success: boolean;
}

export default class AuthResetPasswordUseCase implements AuthResetPasswordUseCasePort {
    constructor(private readonly usersRepository: UsersRepositoryPort) {}

    async execute(
        resetPasswordToken: string,
        authResetPasswordDTO: AuthResetPasswordDTO,
    ): Promise<AuthResetPasswordUseCaseResponse> {
        const { newPassword, confirmNewPassword } = authResetPasswordDTO;

        if (!PasswordValidator.isEqual(newPassword, confirmNewPassword))
            throw new ClientException(ErrorsMessages.PASSWORDS_NOT_EQUAL);

        const { user } = await this.usersRepository.getByResetPasswordToken(resetPasswordToken);

        if (user) {
            const hashedPassword = await Bcrypt.hash(newPassword);

            await this.usersRepository.resetPassword(user.id, hashedPassword);

            return { success: true };
        }

        throw new ClientException(ErrorsMessages.RESET_PASSWORD_TOKEN_INVALID);
    }
}
