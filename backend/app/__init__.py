from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables first
load_dotenv()

# Route Blueprints
from app.routes.status import status_bp
from app.routes.extract_connect import connect_bp
from app.routes.extract_lex import lex_bp
from app.routes.extract_lambda import lambda_bp
from app.routes.snapshot import snapshot_bp
from app.routes.snapshot_list import snapshot_list_bp
from app.routes.accounts import accounts_bp
from app.routes.rollback import rollback_bp
from app.routes.deploy import deploy_bp
from app.routes.list_resource_names import list_names_bp

def create_app():
    app = Flask(__name__)

    # Enable CORS globally
    CORS(app)

    # Register API Blueprints
    app.register_blueprint(status_bp)
    app.register_blueprint(connect_bp)
    app.register_blueprint(lex_bp)
    app.register_blueprint(lambda_bp)
    app.register_blueprint(snapshot_bp)
    app.register_blueprint(snapshot_list_bp)
    app.register_blueprint(accounts_bp)
    app.register_blueprint(rollback_bp)
    app.register_blueprint(deploy_bp)
    app.register_blueprint(list_names_bp)

    return app

# Serverless handler
from mangum import Mangum
app = create_app()
handler = Mangum(app)