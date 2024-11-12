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
      .required('Título é obrigatório')
      .min(3, 'Título deve ter no mínimo 3 caracteres')
      .max(255, 'Título deve ter no máximo 255 caracteres'),
    content: yup.string().required('Conteúdo é obrigatório'),
    userId: yup.string().required('UserId é obrigatório'),
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    return new CreatePostDTO(validatedData);
  }
}
