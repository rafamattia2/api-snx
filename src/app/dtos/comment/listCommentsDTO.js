import * as yup from 'yup';

export class ListCommentsDTO {
  constructor(data) {
    this.postId = data.postId;
    this.page = data.page;
    this.limit = data.limit;
  }

  static schema = yup.object().shape({
    postId: yup.number().required('Post ID is required'),
    page: yup.number().default(1),
    limit: yup.number().default(10),
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return new ListCommentsDTO(validatedData);
  }
}
