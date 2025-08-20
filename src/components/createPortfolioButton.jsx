import { useState, forwardRef } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Snackbar, Alert, CircularProgress, Slide
} from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreatePortfolioButton({ userId = 2, onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });
  const [nameError, setNameError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");

    const cleanName = name.trim();
    const cleanDesc = description.trim();
    if (!cleanName) {
      const msg = "Name is required";
      setNameError(msg);
      setToast({ open: true, msg, severity: "warning" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          name: cleanName,
          description: cleanDesc,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          const msg = data.message || "A portfolio with this name already exists for this user.";
          setNameError(msg);
          setToast({ open: true, msg, severity: "error" });
          return;
        }
        const msg = data.error || `HTTP ${res.status}`;
        setNameError(msg);
        setToast({ open: true, msg, severity: "error" });
        return;
      }

      setToast({ open: true, msg: "Portfolio created successfully", severity: "success" });
      setOpen(false);
      setName("");
      setDescription("");
      onCreated?.(data);
    } catch (err) {
      const msg = err.message || "Unexpected error";
      setNameError(msg);
      setToast({ open: true, msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* This matches the original look: contained + startIcon + custom colors */}
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setOpen(true)}
        startIcon={<CreateNewFolderIcon />}
        sx={{
          bgcolor: "#00A199",
          ":hover": { bgcolor: "#008B83" },
          transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
          transform: "translateZ(0)",
          willChange: "transform",
          "&:hover": { transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(0px) scale(0.98)" }
        }}
      >
        Create
      </Button>

      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle>Create portfolio</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                error={Boolean(nameError)}
                helperText={nameError || " "}
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={2}
              />
              <TextField
                label="User ID"
                type="number"
                value={userId}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading} startIcon={!loading && <CreateNewFolderIcon />}>
              {loading ? <CircularProgress size={22} /> : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
