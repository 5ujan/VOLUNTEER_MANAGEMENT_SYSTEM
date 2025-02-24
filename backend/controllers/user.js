const db = require("../connectDB");

const updateProfile = async (req, res) => {
    console.log(req.user);
    try {
      if (!req.user || !req.user.role) {
        return res.status(400).json({ message: "User role is not found" });
      }
  
      if (req.user.role === "volunteer") {
        const { name, email, phone, gender, dob, skills, avatar, created_at } = req.body;
        
        // Update volunteer profile
        const updateVolunteerQuery = `
          UPDATE VOLUNTEER
          SET name = ?, email = ?, phone = ?, gender = ?, dob = ?, avatar = ?, created_at = ?
          WHERE volunteer_id = ?`;
        await db.query(updateVolunteerQuery, [name, email, phone, gender, dob, avatar, created_at, req.user.id]);
  
        // Update skills if provided
        if (skills && skills.length) {
          await db.query("DELETE FROM VOLUNTEER_SKILLS WHERE volunteer_id = ?", [req.user.id]);
          const insertSkillsQuery = "INSERT INTO VOLUNTEER_SKILLS (volunteer_id, skill_id) VALUES ?";
          const skillsValues = skills.map(skill => [req.user.id, skill]);
          await db.query(insertSkillsQuery, [skillsValues]);
        }
        
        return res.status(200).json({ message: "Profile updated successfully" });
      }
  
      if (req.user.role === "organization") {
        const { organization_name, email, contact_phone, avatar, established_date, contact_email } = req.body;
        
        // Update organization profile
        const updateOrganizationQuery = `
          UPDATE ORGANIZATION
          SET organization_name = ?, email = ?, contact_phone = ?, avatar = ?, established_date = ?, contact_email = ?
          WHERE organization_id = ?`;
        await db.query(updateOrganizationQuery, [organization_name, email, contact_phone, avatar, established_date, contact_email, req.user.id]);
  
        
  
        return res.status(200).json({ message: "Organization profile updated successfully" });
      }
  
      if (req.user.role === "admin") {
        return res.status(403).json({ message: "Admin profiles cannot be updated here" });
      }
      
      return res.status(403).json({ message: "Forbidden access" });
    } catch (err) {
      console.error("Error in /updateProfile route: ", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  


const getData = async (req, res) => {
    console.log(req.user)
    try {
        if (!req.user || !req.user.role) {
            return res.status(400).json({ message: "User role is not found" });
        }

        // Handle volunteer data
        if (req.user.role === "volunteer") {
            const volunteerQuery = `
                SELECT volunteer_id AS id, name, email, dob, phone, gender, created_at , avatar
                FROM VOLUNTEER 
                WHERE volunteer_id = ?`;
            
            const skillsQuery = `
                SELECT S.skill_name 
                FROM SKILLS S
                JOIN VOLUNTEER_SKILLS VS ON S.skill_id = VS.skill_id
                WHERE VS.volunteer_id = ?`;

            const [volunteerRows] = await db.query(volunteerQuery, [req.user.id]);
            if (volunteerRows.length === 0) {
                return res.status(404).json({ message: "Volunteer not found" });
            }

            const [skillsRows] = await db.query(skillsQuery, [req.user.id]);
            const skills = skillsRows.map(row => row.skill_name);

            const volunteer = volunteerRows[0];
            res.json({ ...volunteer, role: "volunteer", skills });
        } 
        // Handle organization data
        else if (req.user.role === "organization") {
            const query = "SELECT organization_id AS id, organization_name AS name, email, established_date AS established_date,avatar, contact_phone AS phone, created_at FROM ORGANIZATION WHERE organization_id = ?";
            const [rows] = await db.query(query, [req.user.id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Organization not found" });
            }

            const organization = rows[0];
            res.json({ ...organization, role: "organization" });
        } 
        // Handle admin data
        else if (req.user.role === "admin") {
            const volunteerQuery = "SELECT volunteer_id AS id, name, email, dob, phone, gender,avatar, role, created_at FROM VOLUNTEER";
            const organizationQuery = "SELECT organization_id AS id, organization_name AS name, role, email,avatar, established_date AS established_date, contact_phone AS phone, created_at FROM ORGANIZATION";

            const [volunteerResults] = await db.query(volunteerQuery);
            const [organizationResults] = await db.query(organizationQuery);

            // Combine both results and return them
            const allUsers = [...volunteerResults, ...organizationResults];
            res.json(allUsers);
        } else {
            return res.status(403).json({ message: "Forbidden access" });
        }
    } catch (err) {
        console.error("Error in /user route: ", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getData, updateProfile };  // Correctly export the function
