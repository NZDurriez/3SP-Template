document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("generate3SP").addEventListener("click", function() {
        const discordID = document.getElementById("discordID").value.replace(/\D/g, '') || "Nil";
        const interactions = cleanInteractions(document.getElementById("interactions").value) || "Nil";
        const staffMember = document.getElementById("staffMember").value || "Nil";
        const staffRole = document.getElementById("staffRole").value || "Nil";
        const hasNitro = document.getElementById("discordNitro").checked; // Check if Nitro checkbox is selected

        // Count the number of warnings, kicks, and bans
        let warnCount = (interactions.match(/warn/gi) || []).length;
        let kickCount = (interactions.match(/kick/gi) || []).length;
        let banCount = (interactions.match(/ban/gi) || []).length;

        // Update the tally in the UI
        document.getElementById("warnCount").innerText = warnCount;
        document.getElementById("kickCount").innerText = kickCount;
        document.getElementById("banCount").innerText = banCount;

        // Generate the cleaned-up summary for staff interactions
        const cleanedInteractions = formatInteractionText(interactions);

        // Ensure discord ID is formatted correctly
        const formattedDiscordID = discordID !== "Nil" ? `<@${discordID}>` : "Nil";

        // Full message for Nitro users
        const fullOutput = `Hello ${formattedDiscordID},

The Beehive Staff has noticed that you have been involved in multiple negative interactions (Warns: ${warnCount}, Kicks: ${kickCount}, Bans: ${banCount}) on the server. It is apparent that there is a consistent breach of our server rules and guidelines, which raises concerns about the frequency of our interactions with you.

Here is a summary of your prior staff interactions:
${cleanedInteractions}

Due to these interactions, the Beehive Staff Team now requires an immediate adjustment in your roleplay approach. Strict compliance with our server rules and guidelines is imperative.

Given the frequency of these interactions, the staff team has unanimously decided to implement a Three Strike Policy (3SP) effective immediately. Any staff interaction that violates the server rules/guidelines will be considered a "strike," and any staff member is authorized to issue one. The consequences for strikes become progressively more severe, as outlined below:

**Three Strike Policy:**

- Strike 1: 1-Day Ban
- Strike 2: 3-Day Ban
- Strike 3: Permanent Ban

If you receive a third strike resulting in a Permanent Ban, you will have the opportunity to appeal this on our website. Ban appeals are reviewed at the end of each month during the staff's available time, and immediate unbanning is not guaranteed.

**Working Towards Removal from 3SP:**

We believe in second chances and positive change within our community. You can work towards being removed from 3SP and returning to normal stature within the community by demonstrating consistent good behavior and adherence to our server rules and guidelines. Engage in positive roleplay, respect fellow players and staff members, and actively contribute to a welcoming and enjoyable gaming environment.

The Beehive Staff Team conducts monthly reviews of members on 3SP, assessing their conduct for that month. This review process aims to evaluate your progress and, when appropriate, grant your return to regular status within the community. Your continued good behavior and adherence to server rules will be taken into consideration during these reviews.

**Important Notes:**

- Surveillance methods are in place even when no staff members are online to monitor player activities.
- The timeframe for being on 3SP is not predetermined; however, demonstrating good behavior and engaging in positive roleplay may lead to its removal sooner.
- Community Rule 11 always applies.

If you have any questions or comments, feel free to share them below. Otherwise, please react to this message with a ✅, and we will close the ticket.

Kind Regards,  
${staffMember}  
${staffRole}`;

        // Split message into two parts for non-Nitro users (under 2000 characters)
        const splitMessagePart1 = `Hello ${formattedDiscordID},

You have been involved in multiple negative interactions (Warns: ${warnCount}, Kicks: ${kickCount}, Bans: ${banCount}). This raises concerns about your compliance with server rules.

Summary of past interactions:
${cleanedInteractions}

The staff team has placed you on a **Three Strike Policy (3SP)**:

- **Strike 1:** 1-Day Ban
- **Strike 2:** 3-Day Ban
- **Strike 3:** Permanent Ban

To be removed from 3SP, demonstrate consistent good behavior and adherence to server rules. Reviews occur monthly.`;

        const splitMessagePart2 = `**Important Notes:**

- Staff surveillance is active at all times.
- The duration of 3SP is not fixed but depends on improvement.
- Community Rule 11 applies.

Please react with ✅ to acknowledge this message.

**Staff:** ${staffMember} (${staffRole})`;

        // Display the appropriate output based on Nitro selection
        if (hasNitro) {
            document.getElementById("outputFull3SP").innerText = fullOutput;
            document.getElementById("outputFull3SP").style.display = "block";
            document.getElementById("outputShort3SP").style.display = "none";
            document.getElementById("outputShort3SP_Part2").style.display = "none";
        } else {
            document.getElementById("outputShort3SP").innerText = splitMessagePart1;
            document.getElementById("outputShort3SP_Part2").innerText = splitMessagePart2;
            document.getElementById("outputShort3SP").style.display = "block";
            document.getElementById("outputShort3SP_Part2").style.display = "block";
            document.getElementById("outputFull3SP").style.display = "none";
        }
    });
});

// Ensure only numbers are entered in Discord ID field
function formatDiscordID() {
    let input = document.getElementById("discordID");
    input.value = input.value.replace(/\D/g, ''); // Remove non-numeric characters
}

// Clean up staff interactions history by removing expiry dates, staff names, and revoked actions
function cleanInteractions(text) {
    return text.replace(/(expires.*|by.*|revoked.*)/gi, '').trim();
}

// Format interaction text for better readability
function formatInteractionText(interactions) {
    if (!interactions || interactions === "Nil") return "Nil";

    let formatted = interactions.split(/\r?\n/).map(line => {
        return "- " + line.trim();
    }).join("\n");

    return formatted;
}
