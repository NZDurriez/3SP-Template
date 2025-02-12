document.addEventListener("DOMContentLoaded", function() {

  // Auto-resize the "interactions" textarea to fit its content.
  const interactionsTextArea = document.getElementById("interactions");
  interactionsTextArea.addEventListener("input", function() {
    this.style.height = "auto"; // Reset height
    this.style.height = this.scrollHeight + "px"; // Set height to match content
  });

  // Copy helper function using the Clipboard API.
  // Accepts a second parameter: the button element.
  window.copyText = function(elementId, button) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      const originalBg = button.style.backgroundColor;
      button.textContent = "Copied";
      button.style.backgroundColor = "#FFC107"; // yellow background
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = originalBg || "#28a745";
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  document.getElementById("generate3SP").addEventListener("click", function() {
    const discordID = document.getElementById("discordID").value.replace(/\D/g, '') || "Nil";
    const interactionsElement = document.getElementById("interactions");
    const staffMember = document.getElementById("staffMember").value || "Nil";
    const staffRole = document.getElementById("staffRole").value || "Nil";
    const nitroSelection = document.getElementById("discordNitro");
    const hasNitro = nitroSelection && nitroSelection.value === "yes"; // "yes" means Nitro

    if (!interactionsElement) {
      console.error("Interactions element not found!");
      return;
    }

    let interactions = interactionsElement.value || "Nil";

    // Group the input text into blocks (each block represents one infraction).
    function groupInfractions(text) {
      const lines = text.split('\n');
      let blocks = [];
      let currentBlock = [];
      const isInfractionStart = (line) => {
        return /^(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)/i.test(line.trim());
      };

      for (let line of lines) {
        if (isInfractionStart(line) && currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n'));
          currentBlock = [];
        }
        currentBlock.push(line);
      }
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
      }
      return blocks;
    }

    // Split into blocks and filter out any block that contains "Revoked by"
    const blocks = groupInfractions(interactions);
    const validBlocks = blocks.filter(block => !/revoked by/i.test(block));

    // Transform each valid block to include only the action and the reason.
    // We assume a proper block has at least three non-empty lines:
    //   - Line 1: Action (e.g., "WARNED by CeeCee")
    //   - Line 2: ID/timestamp (to omit)
    //   - Line 3: Reason
    // If there are only two lines, return both.
    const transformedBlocks = validBlocks.map(block => {
      const lines = block.split("\n").map(line => line.trim()).filter(line => line !== "");
      if (lines.length >= 3) {
        return lines[0] + "\n" + lines[2];
      } else if (lines.length === 2) {
        return lines[0] + "\n" + lines[1];
      } else {
        return lines[0] || "";
      }
    });
    const validInteractions = transformedBlocks.join('\n\n');

    /* 
      Insert a space between an action (warn/warned, kick/kicked, ban/banned)
      and a following digit if needed.
    */
    let processedInteractions = validInteractions.replace(/(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)(?=\d)/gi, '$1 ');

    // Remove any lingering " by <staff member>" text following the action word.
    processedInteractions = processedInteractions.replace(/(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)(\s+by\s+\S+)/gi, '$1');

    // (Optional) Tally counts can be computed if needed.
    let warnCount = (processedInteractions.match(/warn/gi) || []).length;
    let kickCount = (processedInteractions.match(/kick/gi) || []).length;
    let banCount = (processedInteractions.match(/ban/gi) || []).length;

    // Clean up interactions by trimming each line.
    const cleanedInteractions = processedInteractions
      .split("\n")
      .map(line => line.trim())
      .join("\n");

    const formattedDiscordID = discordID !== "Nil" ? `<@${discordID}>` : "Nil";

    // Build the full output using the exact template.
    const fullOutput = `Hello ${formattedDiscordID}, 

The Beehive Staff have noticed that you have been involved in multiple negative interactions (Warns/Kicks/Bans) on the server. It is apparent that there is a consistent breach of our server rules and guidelines, which raises concerns about the frequency of our interactions with you. 

Below is a summary of your prior staff interactions:
\`\`\`${cleanedInteractions}\`\`\`

Due to these interactions, the Beehive Staff Team now require an immediate adjustment in your roleplay approach. Strict compliance with our server rules and guidelines is imperative. 

Given the frequency of these interactions, the staff team has unanimously decided to implement a Three Strike Policy (3SP) effective immediately. Any staff interaction that violates the server rules/guidelines will be considered a "strike," and any staff member is authorized to issue one. The consequences for strikes become progressively more severe, as outlined below:

**Three Strike Policy:**
- Strike 1: 1 Day Ban | Subject to longer ban 
- Strike 2: 3 Day Ban | Subject to longer ban 
- Strike 3: Permanent Ban

In the event that you receive a third strike resulting in a Permanent Ban, you will have the opportunity to appeal this on our website. Ban appeals are reviewed at the end of each month during the staff's available time, and immediate unbanning is not guaranteed.

**Working towards Coming Off 3SP:**
We believe in second chances and positive change within our community. You can work towards coming off 3SP and returning to normal stature within the community by demonstrating consistent good behaviour and adherence to our server rules and guidelines. Engage in positive roleplay, respect fellow players and staff members, and actively contribute to a welcoming and enjoyable gaming environment.

The Beehive Staff Team conduct monthly reviews of members who are on 3SP, assessing their conduct for that month. This review process aims to evaluate your progress and, when appropriate, grant your return to regular status within the community. Your continued good behavior and adherence to server rules will be taken into consideration during these reviews. 

**Please take note of the following:**
- Surveillance methods are in place even when no staff members are online to monitor player activities.
- The timeframe for being on 3SP is not predetermined; however, demonstrating good behavior and engaging in positive roleplay may lead to its removal sooner. 
- Community Rule 11 always applies.

If you have any questions or comments, feel free to share them below. Otherwise, please react to this message with a ✅, and we will close the ticket.

Kind Regards,
${staffMember},
${staffRole}`;

    // For non-Nitro users, split the output at a newline boundary near the midpoint.
    if (!hasNitro) {
      let midPoint = Math.floor(fullOutput.length / 2);
      let splitIndex = fullOutput.lastIndexOf("\n", midPoint);
      if (splitIndex === -1) {
        splitIndex = fullOutput.indexOf("\n", midPoint);
        if (splitIndex === -1) {
          splitIndex = midPoint;
        }
      }
      let part1 = fullOutput.substring(0, splitIndex);
      let part2 = fullOutput.substring(splitIndex);

      // Check if the first half has an unclosed code block.
      let codeBlockCount = (part1.match(/```/g) || []).length;
      if (codeBlockCount % 2 !== 0) {
         part1 = part1 + "\n```";
         part2 = "```\n" + part2;
      }
      
      document.getElementById("outputShort3SP").textContent = part1;
      document.getElementById("outputShort3SP_Part2").textContent = part2;

      // Show the two separate output containers.
      document.getElementById("shortOutputContainer").style.display = "block";
      document.getElementById("shortOutputPart2Container").style.display = "block";
      document.getElementById("fullOutputContainer").style.display = "none";
    } else {
      document.getElementById("outputFull3SP").textContent = fullOutput;
      // Show the single full output container.
      document.getElementById("fullOutputContainer").style.display = "block";
      document.getElementById("shortOutputContainer").style.display = "none";
      document.getElementById("shortOutputPart2Container").style.display = "none";
    }
  });
});
