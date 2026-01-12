import handleGetRepository from '../utils/handleGetRepository';
import { User } from '../entities/User.postgres';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { ProductService } from '../service/product.service';
import { PasswordReset } from '../entities/PasswordReset.postgres';

const userRepository = handleGetRepository(User);
const passwordResetRepository = handleGetRepository(PasswordReset);
export const userService = new UserService(userRepository);
export const authService = new AuthService(userRepository, passwordResetRepository);
export const productService = new ProductService();
