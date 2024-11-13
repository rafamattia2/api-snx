import * as yup from 'yup';

export class UpdateCommentDTO {
  constructor(data) {
    this.id = data.id;
    this.content = data.content;
    this.userId = data.userId;
  }

  static schema = yup.object().shape({
    id: yup.number().required('Comment ID is required'),
    content: yup
      .string()
      .required('Content is required')
      .min(1, 'Content cannot be empty'),
    userId: yup.string().required('User ID is required'),
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return new UpdateCommentDTO(validatedData);
  }
}
