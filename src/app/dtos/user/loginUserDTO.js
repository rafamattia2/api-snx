import * as yup from 'yup';

export class LoginUserDTO {
  constructor(data) {
    this.username = data.username;
    this.password = data.password;
  }

  static schema = yup.object().shape({
    username: yup.string().required('Username is required').trim(),
    password: yup.string().required('Password is required'),
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return new LoginUserDTO(validatedData);
  }
}
