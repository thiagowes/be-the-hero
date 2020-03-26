const connection = require('../database/connection');

module.exports = {
  async create(request, response) {
    const ong_id = request.headers.authorization;
    const { title, description, value } = request.body;

    const [id] = await connection('incidents').insert({ title, description, value, ong_id });

    return response.json({ id });
  },

  async list(request, response) {
    const { page = 1 } = request.query;

    const [count] = await connection('incidents').count();

    const incidents = await connection('incidents')
      .select([
        'incidents.*',
        'ongs.name as ong_name',
        'ongs.email as ong_email',
        'ongs.whatsapp as ong_whatsapp',
        'ongs.city as ong_city',
        'ongs.uf as ong_uf',
      ])
      .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
      .limit(5)
      .offset((page - 1) * 5);

    response.header('X-Total-Count', count['count(*)']);

    return response.json(incidents);
  },

  async delete(request, response) {
    const { id } = request.params;
    const ong_id = request.headers.authorization;

    const incidents = await connection('incidents')
      .select('ong_id')
      .where('id', id)
      .first();

    if (incidents.ong_id != ong_id) {
      return response.status(401).json({ error: 'Operation not permitted' });
    }
    await connection('incidents')
      .delete()
      .where('id', id);

    return response.status(204).send();
  },
};
