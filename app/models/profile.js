import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  author: DS.attr('string'),
  content: DS.attr('string'),
  place: DS.belongsTo('place'),
  report: DS.belongsTo('report')
});