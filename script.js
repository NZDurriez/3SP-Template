document.addEventListener("DOMContentLoaded", function() {

  // Auto-resize the "interactions" textarea to fit its content.
  const interactionsTextArea = document.getElementById("interactions");
  interactionsTextArea.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });

  // Copy helper function using the Clipboard API.
  window.copyText = function(elementId, button) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      const originalBg = button.style.backgroundColor;
      button.textContent = "Copied";
      button.style.backgroundColor = "#FFC107";
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = originalBg || "#28a745";
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy text:", err);
    });
  };

  // Helper: split a verbatim message into three parts (≤1999 chars), backtracking to avoid cutting words,
  // and ensure new parts do not start with a space.
  function splitIntoThreeVerbatim(message) {
    const MAX = 1999;
    const parts = [];
    let start = 0;

    for (let i = 0; i < 3; i++) {
      if (start >= message.length) {
        parts.push("");
        continue;
      }

      let end = Math.min(start + MAX, message.length);
      if (end < message.length) {
        const lastSpace = message.lastIndexOf(" ", end);
        const lastNl    = message.lastIndexOf("\n", end);
        const splitPos  = Math.max(lastSpace, lastNl);
        if (splitPos > start) {
          end = splitPos;
        }
      }

      let part = message.slice(start, end);
      // Remove leading space if this is part 2 or 3
      if (i > 0 && part.startsWith(" ")) {
        part = part.slice(1);
      }

      parts.push(part);
      start = end;
    }

    return parts;
  }

  document.getElementById("generate3SP").addEventListener("click", function() {
    const discordID    = document.getElementById("discordID").value.replace(/\D/g, '') || "Nil";
    const interactions = document.getElementById("interactions").value || "Nil";
    const staffMember  = document.getElementById("staffMember").value || "Nil";
    const staffRole    = document.getElementById("staffRole").value || "Nil";
    const hasNitro     = document.getElementById("discordNitro").value === "yes";

    // GROUPING: Split the input text into infraction blocks
    function groupInfractions(text) {
      const lines = text.split('\n');
      let blocks = [];
      let currentBlock = [];
      const isInfractionStart = (line) => /^(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)/i.test(line.trim());

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

    const blocks = groupInfractions(interactions);
    const validBlocks = blocks.filter(block => !/revoked by/i.test(block));

    // TALLYING: Count warns, kicks, bans
    let warnCount = 0, kickCount = 0, banCount = 0;
    validBlocks.forEach(block => {
      const lines = block.split("\n").map(l => l.trim()).filter(l => l);
      if (lines.length) {
        const actionLine = lines[0];
        if (/warn/i.test(actionLine)) warnCount++;
        if (/kick/i.test(actionLine)) kickCount++;
        if (/ban/i.test(actionLine)) banCount++;
      }
    });

    // TRANSFORMATION: Extract action + reason
    const transformedBlocks = validBlocks.map(block => {
      const lines = block.split("\n").map(l => l.trim()).filter(l => l);
      if (lines.length >= 3) {
        return lines[0] + "\n" + lines[2];
      } else if (lines.length === 2) {
        return lines[0] + "\n" + lines[1];
      }
      return lines[0] || "";
    });
    const validInteractions = transformedBlocks.join('\n\n');

    // PROCESSING: Fix spacing and remove "by <staff>"
    let processedInteractions = validInteractions.replace(/(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)(?=\d)/gi, '$1 ');
    processedInteractions = processedInteractions.replace(/(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)(\s+by\s+\S+)/gi, '$1');

    // CLEANING: Trim each line
    const cleanedInteractions = processedInteractions.split("\n").map(l => l.trim()).join("\n");

    const formattedDiscordID = discordID !== "Nil" ? `<@${discordID}>` : "Nil";

    // OUTPUT: Full 3SP template (verbatim)
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

    // SPLITTING OUTPUT & DISPLAY
    if (!hasNitro) {
      const [p1, p2, p3] = splitIntoThreeVerbatim(fullOutput);
      document.getElementById("outputShort3SP").textContent      = p1;
      document.getElementById("outputShort3SP_Part2").textContent = p2;
      document.getElementById("outputShort3SP_Part3").textContent = p3;
      document.getElementById("shortOutputContainer").style.display      = "block";
      document.getElementById("shortOutputPart2Container").style.display = "block";
      document.getElementById("shortOutputPart3Container").style.display = p3.length ? "block" : "none";
      document.getElementById("fullOutputContainer").style.display       = "none";
    } else {
      document.getElementById("outputFull3SP").textContent = fullOutput;
      document.getElementById("fullOutputContainer").style.display       = "block";
      document.getElementById("shortOutputContainer").style.display      = "none";
      document.getElementById("shortOutputPart2Container").style.display = "none";
      document.getElementById("shortOutputPart3Container").style.display = "none";
    }

    // Update tally boxes
    document.getElementById("warnCount").innerText = warnCount;
    document.getElementById("kickCount").innerText = kickCount;
    document.getElementById("banCount").innerText = banCount;
  });
});
