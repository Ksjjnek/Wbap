import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
# Разрешаем запросы с твоего сайта на GitHub
CORS(app)

# ВАЖНО: Используй здесь ссылку от Connection Pooler (порт 6543)
DATABASE_URL = os.getenv('postgresql://postgres.zjaeftnfjdcgdrpepvtx:ts5BdN4hvZGnuch@aws-0-eu-west-1.pooler.supabase.com:6543/postgres")

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Ошибка подключения к БД: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        # Создаем таблицу, если её нет, со всеми нужными полями
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                tg_id BIGINT PRIMARY KEY,
                name TEXT,
                balance FLOAT DEFAULT 0,
                banned BOOLEAN DEFAULT FALSE,
                ban_reason TEXT,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        cur.close()
        conn.close()

# Запускаем инициализацию БД при старте
init_db()

# --- ЭНДПОИНТЫ ДЛЯ АДМИНКИ ---

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    # В реальности лучше хранить это в переменных окружения
    if data.get('login') == 'admin' and data.get('password') == '12345':
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500
    
    cur = conn.cursor()
    # Берем расширенный список данных
    cur.execute("SELECT tg_id as id, name, balance, banned FROM users ORDER BY registration_date DESC")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users)

@app.route('/api/admin/action', methods=['POST'])
def admin_action():
    data = request.json
    action_type = data.get('action')
    tg_id = data.get('tg_id')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "DB connection failed"})
    
    cur = conn.cursor()
    try:
        if action_type == 'topup':
            amount = float(data.get('amount', 0))
            cur.execute("UPDATE users SET balance = balance + %s WHERE tg_id = %s", (amount, tg_id))
        
        elif action_type == 'ban':
            cur.execute("UPDATE users SET banned = TRUE WHERE tg_id = %s", (tg_id,))
            
        elif action_type == 'unban':
            cur.execute("UPDATE users SET banned = FALSE WHERE tg_id = %s", (tg_id,))
            
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        cur.close()
        conn.close()

# Запуск приложения
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
