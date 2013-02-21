window.TodURLsClient = (function() {
var client = {
	appID: 'drugs-escapes-418',
	token: null,
	simperium: null,
	bucket: null,

	model: null,
	collection: null,

	app: null,

	initialize: function() {
		this.getCookie();

		if ( ! this.token ) {
			jQuery( '#get-started' ).show();

			setTimeout( function() {
				TodURLsClient.initialize.call( TodURLsClient );
			}, 5000 );
			return;
		}

		jQuery( '#get-started' ).hide();

		this.simperium = new Simperium( client.appID, {
			token: client.token
		} );

		this.bucket = this.simperium.bucket( 'todurls' );

		var Todo = Backbone.Model.extend( {
			defaults: { 
				url        : '',
				image      : '',
				title      : '',
				description: ''
			},

			initialize: function() {
				this.on( 'delete', this.destroy, this );
			}
		} );

		this.model = Todo;

		var TodoList = Backbone.SimperiumCollection.extend( {
			model: Todo,

			remove: function() {
				Backbone.SimperiumCollection.prototype.remove.apply( this, arguments );

				if ( ! this.isEmpty() ) {
					return;
				}

				this.trigger( 'empty' );
			},
		} );

		this.collection = new TodoList( [], { bucket: client.bucket } );

		var TodoView = Backbone.View.extend( {
			tagName: 'li',
			className: 'todurl',
			template: _.template( jQuery( '#template-todurl' ).html() ),

			events: {
				'click span' : 'delete'
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
			}
		} );

		var AppView = Backbone.View.extend( {
			el    : jQuery( '#todurls' ),
			helpEl: jQuery( '#help' ),
			listEl: null,

			initialize: function() {
				this.listEl = this.$( '#todurls-list' );
				this.helpEl.show();

				this.listenTo( client.collection, 'add',   this.addOne );
				this.listenTo( client.collection, 'reset', this.addAll );
				this.listenTo( client.collection, 'empty', this.displayHelp );
			},

			addOne: function( todo ) {
				this.helpEl.hide();
				var view = new TodoView( { model: todo } );
				this.listEl.prepend( view.render().el );
			},

			addAll: function() {
				client.collection.each( this.addOne, this );
			},

			displayHelp: function() {
				this.helpEl.show();
			}
		} );

		this.app = new AppView;
	},

	getCookie: function() {
		var token = document.cookie.match( /token=[^;]*(?=;|$)/ );
		if ( ! token ) {
			return;
		}

		this.token = token[0].split( '=' )[1];
	}
};

return client;

})();
