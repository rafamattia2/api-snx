import * as yup from 'yup';

export class CreatePostDTO {
  constructor(data) {
    this.title = data.title;
    this.content = data.content;
    this.userId = data.userId;
  }

  static schema = yup.object().shape({
    title: yup
      .string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must be at most 255 characters')
      .trim(),
    content: yup.string().required('Content is required').trim(),
    userId: yup
      .string()
      .required('UserId is required')
      .matches(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'), // MongoDB ID validation
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return new CreatePostDTO(validatedData);
  }
}
