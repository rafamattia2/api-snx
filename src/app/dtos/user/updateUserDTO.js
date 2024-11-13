import * as yup from 'yup';

export class UpdateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.username = data.username;
    this.password = data.password;
  }

  static schema = yup.object().shape({
    name: yup.string().min(2, 'Name must be at least 2 characters'),
    username: yup.string().min(3, 'Username must be at least 3 characters'),
    password: yup.string().min(6, 'Password must be at least 6 characters'),
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return new UpdateUserDTO(validatedData);
  }
}
