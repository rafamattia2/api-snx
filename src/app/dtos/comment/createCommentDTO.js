import * as yup from 'yup';

export class CreateCommentDTO {
  constructor(data) {
    this.content = data.content;
    this.postId = data.postId;
    this.userId = data.userId;
  }

  static schema = yup.object().shape({
    content: yup.string().required('Content is required').trim(),
    postId: yup.number().required('Post ID is required'),
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
    return new CreateCommentDTO(validatedData);
  }
}
