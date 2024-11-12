import * as yup from 'yup';

export class DeleteCommentDTO {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
  }

  static schema = yup.object().shape({
    id: yup.number().required('Comment ID is required'),
    userId: yup
      .string()
      .required('User ID is required')
      .matches(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'), // MongoDB ID validation
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return new DeleteCommentDTO(validatedData);
  }
}
