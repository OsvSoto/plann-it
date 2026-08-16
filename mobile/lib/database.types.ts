export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      actividad: {
        Row: {
          actividad_desc: string
          actividad_fecha: string
          actividad_id: string
          actividad_tarea_id: string
          actividad_tipo: string
          actividad_usuario_id: string
        }
        Insert: {
          actividad_desc: string
          actividad_fecha: string
          actividad_id?: string
          actividad_tarea_id: string
          actividad_tipo: string
          actividad_usuario_id: string
        }
        Update: {
          actividad_desc?: string
          actividad_fecha?: string
          actividad_id?: string
          actividad_tarea_id?: string
          actividad_tipo?: string
          actividad_usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividad_tarea_id_fkey"
            columns: ["actividad_tarea_id"]
            isOneToOne: false
            referencedRelation: "tarea"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "actividad_usuario_id_fkey"
            columns: ["actividad_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      analisis_ia: {
        Row: {
          analisis_ia_fechageneracion: string
          analisis_ia_id: string
          analisis_ia_proyecto_id: string
          analisis_ia_resultado: string
        }
        Insert: {
          analisis_ia_fechageneracion?: string
          analisis_ia_id?: string
          analisis_ia_proyecto_id: string
          analisis_ia_resultado: string
        }
        Update: {
          analisis_ia_fechageneracion?: string
          analisis_ia_id?: string
          analisis_ia_proyecto_id?: string
          analisis_ia_resultado?: string
        }
        Relationships: [
          {
            foreignKeyName: "analisis_ia_proyecto_id_fkey"
            columns: ["analisis_ia_proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyecto_id"]
          },
        ]
      }
      archivo: {
        Row: {
          archivo_fecha_subida: string
          archivo_id: string
          archivo_nombre: string
          archivo_tamano: number
          archivo_tipo: string
          archivo_url: string
        }
        Insert: {
          archivo_fecha_subida: string
          archivo_id?: string
          archivo_nombre: string
          archivo_tamano: number
          archivo_tipo: string
          archivo_url: string
        }
        Update: {
          archivo_fecha_subida?: string
          archivo_id?: string
          archivo_nombre?: string
          archivo_tamano?: number
          archivo_tipo?: string
          archivo_url?: string
        }
        Relationships: []
      }
      asignaciontarea: {
        Row: {
          asignacion_tarea_active: boolean
          asignacion_tarea_fin: string
          asignacion_tarea_id: string
          asignacion_tarea_inicio: string
          asignacion_tarea_miembro_id: string
          asignacion_tarea_tarea_id: string
        }
        Insert: {
          asignacion_tarea_active?: boolean
          asignacion_tarea_fin: string
          asignacion_tarea_id?: string
          asignacion_tarea_inicio?: string
          asignacion_tarea_miembro_id: string
          asignacion_tarea_tarea_id: string
        }
        Update: {
          asignacion_tarea_active?: boolean
          asignacion_tarea_fin?: string
          asignacion_tarea_id?: string
          asignacion_tarea_inicio?: string
          asignacion_tarea_miembro_id?: string
          asignacion_tarea_tarea_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignaciontarea_miembro_id_fkey"
            columns: ["asignacion_tarea_miembro_id"]
            isOneToOne: false
            referencedRelation: "miembroproyecto"
            referencedColumns: ["miembro_proyecto_id"]
          },
          {
            foreignKeyName: "asignaciontarea_tarea_id_fkey"
            columns: ["asignacion_tarea_tarea_id"]
            isOneToOne: false
            referencedRelation: "tarea"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      etiqueta: {
        Row: {
          etiqueta_color: string
          etiqueta_id: string
          etiqueta_nombre: string
        }
        Insert: {
          etiqueta_color: string
          etiqueta_id?: string
          etiqueta_nombre: string
        }
        Update: {
          etiqueta_color?: string
          etiqueta_id?: string
          etiqueta_nombre?: string
        }
        Relationships: []
      }
      etiquetatarea: {
        Row: {
          etiqueta_tarea_etiqueta_id: string
          etiqueta_tarea_id: string
          etiqueta_tarea_tarea_id: string
        }
        Insert: {
          etiqueta_tarea_etiqueta_id: string
          etiqueta_tarea_id?: string
          etiqueta_tarea_tarea_id: string
        }
        Update: {
          etiqueta_tarea_etiqueta_id?: string
          etiqueta_tarea_id?: string
          etiqueta_tarea_tarea_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "etiquetatarea_etiqueta_id_fkey"
            columns: ["etiqueta_tarea_etiqueta_id"]
            isOneToOne: false
            referencedRelation: "etiqueta"
            referencedColumns: ["etiqueta_id"]
          },
          {
            foreignKeyName: "etiquetatarea_tarea_id_fkey"
            columns: ["etiqueta_tarea_tarea_id"]
            isOneToOne: false
            referencedRelation: "tarea"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      invitacionproyecto: {
        Row: {
          invitacion_estado: string
          invitacion_fecha: string
          invitacion_id: string
          invitacion_proyecto_id: string
          invitacion_usuario_id: string
        }
        Insert: {
          invitacion_estado?: string
          invitacion_fecha?: string
          invitacion_id?: string
          invitacion_proyecto_id: string
          invitacion_usuario_id: string
        }
        Update: {
          invitacion_estado?: string
          invitacion_fecha?: string
          invitacion_id?: string
          invitacion_proyecto_id?: string
          invitacion_usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitacionproyecto_proyecto_id_fkey"
            columns: ["invitacion_proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "invitacionproyecto_usuario_id_fkey"
            columns: ["invitacion_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      lista: {
        Row: {
          lista_id: string
          lista_nombre: string
          lista_orden: number
          lista_tablero_id: string
        }
        Insert: {
          lista_id?: string
          lista_nombre: string
          lista_orden: number
          lista_tablero_id: string
        }
        Update: {
          lista_id?: string
          lista_nombre?: string
          lista_orden?: number
          lista_tablero_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lista_tablero_id_fkey"
            columns: ["lista_tablero_id"]
            isOneToOne: false
            referencedRelation: "tablero"
            referencedColumns: ["tablero_id"]
          },
        ]
      }
      mensaje: {
        Row: {
          mensaje_fecha_envio: string
          mensaje_id: string
          mensaje_proyecto_id: string
          mensaje_texto: string
          mensaje_usuario_id: string | null
        }
        Insert: {
          mensaje_fecha_envio?: string
          mensaje_id?: string
          mensaje_proyecto_id: string
          mensaje_texto: string
          mensaje_usuario_id?: string | null
        }
        Update: {
          mensaje_fecha_envio?: string
          mensaje_id?: string
          mensaje_proyecto_id?: string
          mensaje_texto?: string
          mensaje_usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensaje_mensaje_proyecto_id_fkey"
            columns: ["mensaje_proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "mensaje_mensaje_usuario_id_fkey"
            columns: ["mensaje_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      mensajearchivo: {
        Row: {
          id: string
          mensaje_archivo_archivo_id: string
          mensaje_archivo_mensaje_id: string
        }
        Insert: {
          id?: string
          mensaje_archivo_archivo_id: string
          mensaje_archivo_mensaje_id: string
        }
        Update: {
          id?: string
          mensaje_archivo_archivo_id?: string
          mensaje_archivo_mensaje_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensajearchivo_archivo_id_fkey"
            columns: ["mensaje_archivo_archivo_id"]
            isOneToOne: false
            referencedRelation: "archivo"
            referencedColumns: ["archivo_id"]
          },
          {
            foreignKeyName: "mensajearchivo_mensaje_id_fkey"
            columns: ["mensaje_archivo_mensaje_id"]
            isOneToOne: false
            referencedRelation: "mensaje"
            referencedColumns: ["mensaje_id"]
          },
        ]
      }
      miembroproyecto: {
        Row: {
          miembro_proyecto_fechaingreso: string
          miembro_proyecto_id: string
          miembro_proyecto_permisos: string
          miembro_proyecto_proyecto_id: string
          miembro_proyecto_rol: string
          miembro_proyecto_usuario_id: string
        }
        Insert: {
          miembro_proyecto_fechaingreso?: string
          miembro_proyecto_id?: string
          miembro_proyecto_permisos: string
          miembro_proyecto_proyecto_id: string
          miembro_proyecto_rol: string
          miembro_proyecto_usuario_id: string
        }
        Update: {
          miembro_proyecto_fechaingreso?: string
          miembro_proyecto_id?: string
          miembro_proyecto_permisos?: string
          miembro_proyecto_proyecto_id?: string
          miembro_proyecto_rol?: string
          miembro_proyecto_usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembroproyecto_proyecto_id_fkey"
            columns: ["miembro_proyecto_proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "miembroproyecto_usuario_id_fkey"
            columns: ["miembro_proyecto_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      notificacion: {
        Row: {
          notificacion_alerta: string
          notificacion_fecha: string
          notificacion_id: string
          notificacion_leida: boolean
          notificacion_tipo: string
          notificacion_usuario_id: string
        }
        Insert: {
          notificacion_alerta: string
          notificacion_fecha?: string
          notificacion_id?: string
          notificacion_leida?: boolean
          notificacion_tipo: string
          notificacion_usuario_id: string
        }
        Update: {
          notificacion_alerta?: string
          notificacion_fecha?: string
          notificacion_id?: string
          notificacion_leida?: boolean
          notificacion_tipo?: string
          notificacion_usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacion_usuario_id_fkey"
            columns: ["notificacion_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      proyecto: {
        Row: {
          proyecto_descripcion: string | null
          proyecto_estado: string
          proyecto_fecha_fin: string
          proyecto_fecha_inicio: string
          proyecto_id: string
          proyecto_nombre: string
        }
        Insert: {
          proyecto_descripcion?: string | null
          proyecto_estado: string
          proyecto_fecha_fin: string
          proyecto_fecha_inicio?: string
          proyecto_id?: string
          proyecto_nombre: string
        }
        Update: {
          proyecto_descripcion?: string | null
          proyecto_estado?: string
          proyecto_fecha_fin?: string
          proyecto_fecha_inicio?: string
          proyecto_id?: string
          proyecto_nombre?: string
        }
        Relationships: []
      }
      tablero: {
        Row: {
          tablero_id: string
          tablero_nombre: string
          tablero_proyecto_id: string
        }
        Insert: {
          tablero_id?: string
          tablero_nombre: string
          tablero_proyecto_id: string
        }
        Update: {
          tablero_id?: string
          tablero_nombre?: string
          tablero_proyecto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tablero_proyecto_id_fkey"
            columns: ["tablero_proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyecto_id"]
          },
        ]
      }
      tarea: {
        Row: {
          tarea_desc: string | null
          tarea_estado: string
          tarea_fecha_entrega: string
          tarea_id: string
          tarea_lista_id: string
          tarea_nombre: string
        }
        Insert: {
          tarea_desc?: string | null
          tarea_estado: string
          tarea_fecha_entrega: string
          tarea_id?: string
          tarea_lista_id: string
          tarea_nombre: string
        }
        Update: {
          tarea_desc?: string | null
          tarea_estado?: string
          tarea_fecha_entrega?: string
          tarea_id?: string
          tarea_lista_id?: string
          tarea_nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarea_lista_id_fkey"
            columns: ["tarea_lista_id"]
            isOneToOne: false
            referencedRelation: "lista"
            referencedColumns: ["lista_id"]
          },
        ]
      }
      tareaarchivo: {
        Row: {
          id: string
          tarea_archivo_archivo_id: string
          tarea_archivo_tarea_id: string
        }
        Insert: {
          id?: string
          tarea_archivo_archivo_id: string
          tarea_archivo_tarea_id: string
        }
        Update: {
          id?: string
          tarea_archivo_archivo_id?: string
          tarea_archivo_tarea_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareaarchivo_archivo_id_fkey"
            columns: ["tarea_archivo_archivo_id"]
            isOneToOne: false
            referencedRelation: "archivo"
            referencedColumns: ["archivo_id"]
          },
          {
            foreignKeyName: "tareaarchivo_tarea_id_fkey"
            columns: ["tarea_archivo_tarea_id"]
            isOneToOne: false
            referencedRelation: "tarea"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      usuario: {
        Row: {
          usuario_bio: string | null
          usuario_correo: string
          usuario_fecharegistro: string
          usuario_foto: string | null
          usuario_id: string
          usuario_nombre: string
        }
        Insert: {
          usuario_bio?: string | null
          usuario_correo: string
          usuario_fecharegistro?: string
          usuario_foto?: string | null
          usuario_id: string
          usuario_nombre: string
        }
        Update: {
          usuario_bio?: string | null
          usuario_correo?: string
          usuario_fecharegistro?: string
          usuario_foto?: string | null
          usuario_id?: string
          usuario_nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_miembro_proyecto: {
        Args: { p_miembro_id: string; p_permisos: string; p_rol: string }
        Returns: string
      }
      asignar_miembro_tarea: {
        Args: { p_miembro_id: string; p_tarea_id: string }
        Returns: string
      }
      crear_proyecto: {
        Args: { p_descripcion: string; p_fecha_fin: string; p_nombre: string }
        Returns: string
      }
      desasignar_miembro_tarea: {
        Args: { p_asignacion_id: string }
        Returns: string
      }
      editar_proyecto: {
        Args: {
          p_descripcion: string
          p_estado: string
          p_fecha_fin: string
          p_nombre: string
          p_proyecto_id: string
        }
        Returns: undefined
      }
      eliminar_miembro_proyecto: {
        Args: { p_miembro_id: string }
        Returns: string
      }
      es_lider_proyecto: { Args: { p_proyecto_id: string }; Returns: boolean }
      es_miembro_proyecto: { Args: { p_proyecto_id: string }; Returns: boolean }
      invitar_usuario_proyecto: {
        Args: { p_correo: string; p_proyecto_id: string }
        Returns: string
      }
      obtener_asignaciones_proyecto: {
        Args: { p_proyecto_id: string }
        Returns: {
          asignacion_id: string
          miembro_proyecto_id: string
          tarea_id: string
          usuario_correo: string
          usuario_id: string
          usuario_nombre: string
        }[]
      }
      obtener_datos_gantt: {
        Args: { p_id_proyecto: string }
        Returns: {
          asignado: string
          color: string
          fecha_fin: string
          fecha_inicio: string
          id_tarea: string
          nombre_tarea: string
        }[]
      }
      obtener_invitaciones_pendientes: {
        Args: never
        Returns: {
          invitacion_fecha: string
          invitacion_id: string
          proyecto_id: string
          proyecto_nombre: string
        }[]
      }
      obtener_miembros_proyecto: {
        Args: { p_proyecto_id: string }
        Returns: {
          miembro_fecha_ingreso: string
          miembro_permisos: string
          miembro_proyecto_id: string
          miembro_rol: string
          usuario_correo: string
          usuario_id: string
          usuario_nombre: string
        }[]
      }
      puede_eliminar_proyecto: {
        Args: { p_proyecto_id: string }
        Returns: boolean
      }
      responder_invitacion: {
        Args: { p_invitacion_id: string; p_respuesta: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
