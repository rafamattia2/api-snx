import * as yup from 'yup';

export class CreateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.username = data.username;
    this.password = data.password;
  }

  static schema = yup.object().shape({
    name: yup.string().required('Name is required').trim(),
    username: yup.string().required('Username is required').trim(),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return new CreateUserDTO(validatedData);
  }
}
