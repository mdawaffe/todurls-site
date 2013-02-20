window.TodURLsClient = (function() {
var client = {
	appID: 'drugs-escapes-418',
	token: '0b4e4c04eb774cd28ef953c593eda10c',
	simperium: null,
	bucket: null,

	model: null,
	collection: null,

	app: null,

	initialize: function() {
		this.simperium = new Simperium( client.appID, {
			token: client.token,
		} );

		this.bucket = this.simperium.bucket( 'todurls' );

		var Todo = Backbone.Model.extend( {
			defaults: { 
				url        : '',
				image      : '',
				title      : '',
				description: '',
			},

			initialize: function() {
				this.on( 'delete', this.destroy, this );
			}
		} );

		this.model = Todo;

		var TodoList = Backbone.SimperiumCollection.extend( {
			model: Todo,
		} );

		this.collection = new TodoList( [], { bucket: client.bucket } );

		var TodoView = Backbone.View.extend( {
			tagName: 'li',
			className: 'todurl',
			template: _.template( jQuery( '#template-todurl' ).html() ),

			events: {
				'click span' : 'delete',
			},

			initialize: function() {
				this.listenTo( this.model, 'change', this.render );
				this.listenTo( this.model, 'destroy', this.remove );
			},

			render: function() {
				this.$el.html( this.template( this.model.toJSON() ) );
				return this;
			},

			delete: function() {
				this.model.trigger( 'delete' );
			},
		} );

		var AppView = Backbone.View.extend( {
			el: jQuery( '#todurls' ),
			listEl: null,

			initialize: function() {
				this.listEl = this.$( '#todurls-list' );

				this.listenTo( client.collection, 'add',   this.addOne );
				this.listenTo( client.collection, 'reset', this.addAll );
			},

			addOne: function( todo ) {
				var view = new TodoView( { model: todo } );
				this.listEl.prepend( view.render().el );
			},

			addAll: function() {
				client.collection.each( this.addOne, this );
			}
		} );

		this.app = new AppView;
	}
};

return client;

})();
