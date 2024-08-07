import { UsersRepositoryPort } from "../repositories/users.repository";
import { ErrorsMessages } from "../utils/errors-messages.util";

interface UserDeleteUseCaseResponse {
    success: boolean;
    jwt_token?: string;
}

export interface UserDeleteUseCasePort {
    execute(email: string): Promise<UserDeleteUseCaseResponse>;
}

export default class UserDeleteUseCase implements UserDeleteUseCasePort {
    constructor(private readonly usersRepository: UsersRepositoryPort) {}

    async execute(email: string): Promise<UserDeleteUseCaseResponse> {
        if (this.usersRepository.findByEmail(email)) {
            await this.usersRepository.deleteByEmail(email);
            return { success: true };
        }

        throw new Error(ErrorsMessages.USER_NOT_FOUND);
    }
}
