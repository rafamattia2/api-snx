import * as yup from 'yup';
export class ListPostsDTO {
  static schema = yup.object().shape({
    page: yup
      .number()
      .min(1, 'Page must be greater than or equal to 1')
      .default(1),
    limit: yup
      .number()
      .min(1, 'Limit must be greater than or equal to 1')
      .max(100, 'Maximum limit is 100 items per page')
      .default(10),
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      stripUnknown: true,
      abortEarly: false,
    });
    return validatedData;
  }
}
