from flask import Blueprint, request, jsonify

templates_bp = Blueprint('templates', __name__)

# Mock storage (replace with a database later)
templates = []

@templates_bp.route('/', methods=['GET'])
def get_templates():
    return jsonify(templates)

@templates_bp.route('/', methods=['POST'])
def create_template():
    data = request.get_json()
    template = {
        "id": len(templates) + 1,
        "content": data.get("content", ""),
        "metadata": data.get("metadata", {})
    }
    templates.append(template)
    return jsonify(template), 201

@templates_bp.route('/<int:template_id>', methods=['PUT'])
def update_template(template_id):
    data = request.get_json()
    for template in templates:
        if template['id'] == template_id:
            template.update(data)
            return jsonify(template)
    return jsonify({"error": "Template not found"}), 404

@templates_bp.route('/<int:template_id>', methods=['DELETE'])
def delete_template(template_id):
    global templates
    templates = [t for t in templates if t['id'] != template_id]
    return jsonify({"message": "Template deleted"}), 200
