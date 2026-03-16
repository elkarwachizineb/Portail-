import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Register a new user
 * Inserts user data into Supabase users table
 */
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      birth_date,
      gender,
      user_phone,
      patrol_id,
      role_id,
      is_high_patrol,
      guardian_first_name,
      guardian_last_name,
      guardian_relationship,
      guardian_relationship_other,
      guardian_cin,
      father_phone,
      mother_phone,
      home_phone,
      additional_info,
      password,
    } = req.body;

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !birth_date ||
      !gender ||
      !user_phone ||
      !patrol_id ||
      !role_id ||
      !password
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert into users table
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          first_name,
          last_name,
          birth_date,
          gender,
          user_phone,
          patrol_id,
          role_id,
          is_high_patrol: is_high_patrol || false,
          guardian_first_name,
          guardian_last_name,
          guardian_relationship,
          guardian_relationship_other,
          guardian_cin,
          father_phone,
          mother_phone,
          home_phone,
          additional_info,
          password,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res
        .status(400)
        .json({ error: error.message || "Registration failed" });
    }

    // Return user data
    res.json({
      id: data.id,
      generated_id: data.generated_id,
      first_name: data.first_name,
      last_name: data.last_name,
      user_phone: data.user_phone,
      gender: data.gender,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Login user
 * Validates first_name, last_name, generated_id, and password against Supabase users table
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { first_name, last_name, generated_id, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !generated_id || !password) {
      return res.status(400).json({
        error: "First name, last name, ID, and password are required"
      });
    }

    // Query users table to find user with matching first_name, last_name and generated_id
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("first_name", first_name)
      .eq("last_name", last_name)
      .eq("generated_id", generated_id)
      .single();

    if (error || !data) {
      console.error("Login error - user not found:", error);
      return res.status(401).json({
        error: "بيانات الدخول غير صحيحة - تأكد من الاسم ورقم العضو"
      });
    }

    // Verify password (simple comparison - في الإنتاج يجب استخدام bcrypt)
    // For now, we're using a simple password check
    // In production, passwords should be hashed
    if (password !== data.password) {
      return res.status(401).json({
        error: "كلمة المرور غير صحيحة"
      });
    }

    // Return user data on successful login
    res.json({
      id: data.id,
      generated_id: data.generated_id,
      first_name: data.first_name,
      last_name: data.last_name,
      user_phone: data.user_phone,
      gender: data.gender,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get user profile
 * Returns logged-in user's data
 */
export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    const { generated_id } = req.query;

    if (!generated_id || typeof generated_id !== "string") {
      return res.status(400).json({ error: "Generated ID is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("generated_id", generated_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: data.id,
      generated_id: data.generated_id,
      first_name: data.first_name,
      last_name: data.last_name,
      user_phone: data.user_phone,
      gender: data.gender,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Save PDF and QR code for a user
 * Stores the PDF and QR code data in Supabase
 */
export const handleSavePdfQrCode: RequestHandler = async (req, res) => {
  try {
    const {
      user_id,
      generated_id,
      pdf_url,
      qr_code_url,
    } = req.body;

    if (!user_id || !pdf_url || !qr_code_url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update user with PDF and QR code URLs
    const { data, error } = await supabase
      .from("users")
      .update({
        pdf_url,
        qr_code_url,
        documents_generated_at: new Date().toISOString(),
      })
      .eq("id", user_id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res
        .status(400)
        .json({ error: error.message || "Failed to save documents" });
    }

    res.json({
      success: true,
      message: "PDF and QR code saved successfully",
      user: {
        id: data.id,
        generated_id: data.generated_id,
        pdf_url: data.pdf_url,
        qr_code_url: data.qr_code_url,
      },
    });
  } catch (error) {
    console.error("Error saving PDF/QR code:", error);
    res.status(500).json({ error: "Server error" });
  }
};
